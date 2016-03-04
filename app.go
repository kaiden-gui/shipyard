package shipyard

type App struct {
	ID             		string   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           		string   `json:"appname,omitempty" gorethink:"appname,omitempty"`
	Label          		string   `json:"label,omitempty" gorethink:"label,omitempty"`
	ContainerNumber     	int   	 `json:"containernumber,omitempty" gorethink:"containernumber,omitempty"`
	Owners          	[]string `json:"owners,omitempty" gorethink:"owners,omitempty"`
}
