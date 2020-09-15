import React, { useEffect, useContext } from "react";
import Page from "./Page";
import { useParams } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import { useImmer } from "use-immer";

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestAccount: 0,
    stopFollowingRequestAccount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  });

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token });
        setState((draft) => {
          draft.profileData = response.data;
        });
        //console.log(response.data);
      } catch (e) {
        console.log("there is a problem");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestAccount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const ourRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token });
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
          //console.log(response.data);
        } catch (e) {
          console.log("there is a problem");
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startFollowingRequestAccount]);

  useEffect(() => {
    if (state.stopFollowingRequestAccount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const ourRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token });
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
          //console.log(response.data);
        } catch (e) {
          console.log("there is a problem");
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestAccount]);

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestAccount++;
    });
  }
  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestAccount++;
    });
  }
  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disable={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disable={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            unFollow <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </a>
      </div>

      <ProfilePosts />
    </Page>
  );
}

export default Profile;
