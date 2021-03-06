package v2

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
	log "github.com/Sirupsen/logrus"
	simplejson "github.com/bitly/go-simplejson"

)

var (
	ErrNotFound        = errors.New("Not found")
	defaultHTTPTimeout = 30 * time.Second
	quit chan int
	quit1 chan int
)

type RegistryClient struct {
	URL        *url.URL
	tlsConfig  *tls.Config
	httpClient *http.Client
}

type Repo struct {
	Namespace  string
	Repository string
}

func newHTTPClient(u *url.URL, tlsConfig *tls.Config, timeout time.Duration) *http.Client {
	httpTransport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	httpTransport.Dial = func(proto, addr string) (net.Conn, error) {
		return net.DialTimeout(proto, addr, timeout)
	}
	return &http.Client{Transport: httpTransport}
}

func NewRegistryClient(registryUrl string, tlsConfig *tls.Config) (*RegistryClient, error) {
	u, err := url.Parse(registryUrl)
	if err != nil {
		return nil, err
	}
	httpClient := newHTTPClient(u, tlsConfig, defaultHTTPTimeout)
	return &RegistryClient{
		URL:        u,
		httpClient: httpClient,
		tlsConfig:  tlsConfig,
	}, nil
}

func (client *RegistryClient) doRequest(method string, path string, body []byte, headers map[string]string) ([]byte, http.Header, error) {
	b := bytes.NewBuffer(body)

	req, err := http.NewRequest(method, client.URL.String()+"/v2"+path, b)
	if err != nil {
		return nil, nil, err
	}

	req.Header.Add("Content-Type", "application/json")
	if headers != nil {
		for header, value := range headers {
			req.Header.Add(header, value)
		}
	}

	resp, err := client.httpClient.Do(req)
	if err != nil {
		if !strings.Contains(err.Error(), "connection refused") && client.tlsConfig == nil {
			return nil, nil, fmt.Errorf("%v. Are you trying to connect to a TLS-enabled daemon without TLS?", err)
		}
		return nil, nil, err
	}

	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}

	if resp.StatusCode == 404 {
		return nil, nil, ErrNotFound
	}

	if resp.StatusCode >= 400 {
		return nil, nil, Error{StatusCode: resp.StatusCode, Status: resp.Status, msg: string(data)}
	}

	return data, resp.Header, nil
}

func (client *RegistryClient) Search(query string) ([]*Repository, error) {
	type repo struct {
		Repositories []string `json:"repositories"`
	}

	uri := fmt.Sprintf("/_catalog")
	data, _, err := client.doRequest("GET", uri, nil, nil)
	//log.Debugf("catalog %s:",data)
	if err != nil {
		return nil, err
	}

	res := &repo{}
	if err := json.Unmarshal(data, &res); err != nil {
		return nil, err
	}

	repos := []*Repository{}
	quit = make(chan int)

	// simple filter for list
	for _, k := range res.Repositories {
		// concurrency
		go client.GetRepo(k, query, &repos)
	}
	for range res.Repositories {
		<- quit
	}

	close(quit)
	//log.Debugf("repos all data:%s",repos)
	return repos, nil
}

//get tags and manifests
func (client *RegistryClient) GetRepo(k string, query string, repos *[]*Repository) error {
	if strings.Index(k, query) == 0 {
		type tagList struct {
			Tags []string `json:"tags"`
		}
		log.Debugf("repo:%s",k)

		uri := fmt.Sprintf("/%s/tags/list", k)
		data, _, err := client.doRequest("GET", uri, nil, nil)
		log.Debugf("tag data:%s",data)
		if err != nil {
			log.Errorf("error to get tag of %s: %s",k,err)
			quit <- 0
			return  err
			//continue
		}

		tl := &tagList{}
		if err := json.Unmarshal(data, &tl); err != nil {
			return  err
		}

		for _, t := range tl.Tags {
			// get the repository and append to the slice
			r, err := client.Repository(k, t)
			if err != nil {
				log.Errorf("error to get manifest of %s: %s",k,err)
				return err
			}
			//log.Debugf("repo data:%s",r)
			*repos = append(*repos, r)
			//log.Debugf("*repos data:%s",*repos)
		}
	}
	quit <- 0
	return nil
}
func (client *RegistryClient) DeleteRepository(repo string, tag string) error {
	r, err := client.Repository(repo, tag)
	if err != nil {
		return err
	}


	uri := fmt.Sprintf("/%s/manifests/%s", repo, r.Digest)
	if _, _, err := client.doRequest("DELETE", uri, nil, nil); err != nil {
		return err
	}

	return nil
}

/*func (client *RegistryClient) DeleteTag(repo string, tag string) error {
	r, err := client.Repository(repo, tag)
	if err != nil {
		return err
	}

	uri := fmt.Sprintf("/%s/manifests/%s", repo, r.Digest)
	if _, _, err := client.doRequest("DELETE", uri, nil, nil); err != nil {
		return err
	}

	return nil
}
*/

func (client *RegistryClient) Repository(name, tag string) (*Repository, error) {
	if tag == "" {
		tag = "latest"
	}

	uri := fmt.Sprintf("/%s/manifests/%s", name, tag)

	data, hdr, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	repo := &Repository{}
	if err := json.Unmarshal(data, &repo); err != nil {
		log.Errorf("repo err data:%s",err)
		return nil, err
	}

	// to get repository size
	j, _ := simplejson.NewJson([]byte(data))
	history,_ := j.Get("history").Array()
	//log.Debugf("history data:%s",history)
	for _, h := range history{
		v1,_ := h.(map[string]interface{})["v1Compatibility"]
		vs := v1.(string)
		vj, _ := simplejson.NewJson([]byte(vs))
		vz,_ := vj.Get("Size").Int64()
		repo.Size += vz
	    	//log.Debugf("each size:%s",vz)
		}

	//log.Debugf("repository data:%s",repo)
	repo.Digest = hdr.Get("Docker-Content-Digest")
	return repo, nil
}
