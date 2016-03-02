package api

import (
	"encoding/json"
	"net/http"
	"strings"
	
	"github.com/gorilla/mux"
	"github.com/kaiden-gui/shipyard"
	log "github.com/Sirupsen/logrus"
	

)

func (a *Api) apps(w http.ResponseWriter, r *http.Request) {
	session, _ := a.manager.Store().Get(r, a.manager.StoreKey())
	username := session.Values["username"].(string)
	log.Debugf("apps username:%s", username)
	apps, err := a.manager.Apps(username)
	log.Debugf("apps:%s ", apps)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(apps); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) app(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appid := vars["appid"]
	
	app, err := a.manager.App(appid)
	log.Debugf("app:%s ", app)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(app); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) addapp(w http.ResponseWriter, r *http.Request) {
	var app *shipyard.App
	if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if app.ID != "" {
		if err := a.manager.UpdateApp(app); err != nil {
			log.Errorf("error updating app: %s", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
	}else{

		if err := a.manager.AddApp(app); err != nil {
			log.Errorf("error saving app: %s", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	log.Infof("added app: name=%s", app.Name)
	w.WriteHeader(http.StatusNoContent)
}
func (a *Api) removeapp(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appid := vars["appid"]
	owners := vars["owners"]
	ow := strings.Split(owners,",")

	if err := a.manager.RemoveApp(appid,ow); err != nil {
		log.Errorf("error deleting app: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
