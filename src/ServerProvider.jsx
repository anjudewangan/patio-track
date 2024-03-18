import React, { useState, useEffect } from "react";
import { Alert, IconButton, LinearProgress } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { useDispatch, useSelector } from "react-redux";
import { useEffectAsync } from "./reactHelper";
import { sessionActions } from "./store";
import loaderGif from "../public/loader.gif";

const ServerProvider = ({ children }) => {
  const dispatch = useDispatch();

  const initialized = useSelector((state) => !!state.session.server);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    if (!error) {
      setLoading(true);
      try {
        const response = await fetch("/api/server");
        if (response.ok) {
          dispatch(sessionActions.updateServer(await response.json()));
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  }, [error]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setError(null)}
          >
            <ReplayIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }
  // if (loading) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignContent: "center",
  //       }}
  //     >
  //       <img
  //         src={loaderGif}
  //         alt="Loader"
  //         style={{ width: "100%", height: "80%" }}
  //       />
  //     </div>
  //   );
  // }
  if (!initialized) {
    return (
      <>
      {/* <LinearProgress/> */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
        >
        <img
          src={loaderGif}
          alt="Loader"
          style={{ width: "100%", height: "80%" }}
          />
      </div>
          </>
    );
  }
  return children;
};

export default ServerProvider;
