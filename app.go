package shipyard

type App struct {
	ID             string   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string   `json:"name,omitempty" gorethink:"name,omitempty"`
	Containers     string   `json:"containers,omitempty"`
}
