package shipyard

type App struct {
	ID             		string   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           		string   `json:"appname,omitempty" gorethink:"appname,omitempty"`
	Label          		string   `json:"label,omitempty" gorethink:"label,omitempty"`
	ContainerNumber     	string   `json:"containers,omitempty"`
	Owner          		[]string `json:"owner,omitempty" gorethink:"owner,omitempty"`
}
