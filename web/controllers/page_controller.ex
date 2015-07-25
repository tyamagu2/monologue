defmodule Monologue.PageController do
  use Monologue.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
