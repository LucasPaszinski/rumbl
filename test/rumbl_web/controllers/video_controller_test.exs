defmodule RumblWeb.VideoControllerTest do
  use RumblWeb.ConnCase, async: true

  describe "with no one logged" do
    test "require user auth on all actions", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.video_path(conn, :new)),
          get(conn, Routes.video_path(conn, :index)),
          get(conn, Routes.video_path(conn, :show, "1 2 3")),
          get(conn, Routes.video_path(conn, :edit, "1 2 3")),
          put(conn, Routes.video_path(conn, :update, "1 2 3")),
          post(conn, Routes.video_path(conn, :create, %{})),
          delete(conn, Routes.video_path(conn, :delete, "1 2 3", %{}))
        ],
        fn conn ->
          assert html_response(conn, 302)
          assert conn.halted
        end
      )
    end
  end

  describe "with a logged in user" do
    setup %{conn: conn, login_as: username} do
      user = user_fixture(username: username)
      conn = assign(conn, :current_user, user)

      {:ok, conn: conn, user: user}
    end

    @tag login_as: "max" # Need the specified tag for work
    test "list all user's videos on index", %{conn: conn, user: user} do
      user_video =
        video_fixture(
          user,
          title: "funny cats"
        )

      other_video =
        video_fixture(
          user_fixture(username: "other"),
          title: "another_video"
        )

      conn = get(conn, Routes.video_path(conn, :index))
      assert html_response(conn, 200) =~ ~r/Listing Videos/
      assert String.contains?(conn.resp_body, user_video.title)
      refute String.contains?(conn.resp_body, other_video.title)
    end
  end
end