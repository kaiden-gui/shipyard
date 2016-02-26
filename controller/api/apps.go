package api

import (
	"encoding/json"
	"net/http"
	
	"github.com/gorilla/mux"
	"github.com/kaiden-gui/shipyard"
	log "github.com/Sirupsen/logrus"
	

)

func (a *Api) apps(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]
	apps, err := a.manager.Apps(username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(apps); err != nil {
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

	if err := a.manager.AddApp(app); err != nil {
		log.Errorf("error saving app: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("added app: name=%s", app.Name)
	w.WriteHeader(http.StatusNoContent)
}
func (a *Api) removeapp(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appid := vars["appid"]

	if err := a.manager.RemoveApp(appid); err != nil {
		log.Errorf("error deleting app: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
