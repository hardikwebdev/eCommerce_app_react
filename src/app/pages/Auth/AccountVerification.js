import React, { Fragment, useState, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import { userActivation } from "../../crud/auth.crud";
import queryString from "query-string";
import { useHistory } from "react-router-dom";
import { showToast } from "../../../utils/utils";

function AccountVerification(props) {
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  useEffect(() => {
    const queryValues =
      props.location && queryString.parse(props.location.search);

    if (queryValues.email && queryValues.verification_token) {
      setTimeout(() => {
        userActivation(queryValues.email, queryValues.verification_token)
          .then((result) => {
            setLoading(false);
            if (result.data.success) {
              // showToast("success", result.data.message);
            }
          })
          .catch((errors) => {
            setLoading(false);
            // showToast("error", errors);
          });
      }, 1500);
    }
  }, [props.location]);

  const onScroll = (e) => {
    const scrollTotal =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    if (
      document.documentElement.scrollTop / scrollTotal > 1.5 ||
      document.documentElement.scrollTop === 0
    ) {
      document.getElementById("outer-container").classList.remove("bg-white");
    } else {
      document.getElementById("outer-container").classList.add("bg-white");
    }
  };

  useEffect(() => {
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Fragment>
      <TitleComponent title={props.title} icon={props.icon} />
      <div className="container-fluid d-flex align-items-center">
        <div className="container mt-5 pt-3">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6 text-center">
              {loading ? (
                <div>
                  <div className="mesh-loader">
                    <div className="set-one">
                      <div className="circle circle-1"></div>
                      <div className="circle circle-2"></div>
                    </div>
                    <div className="set-two">
                      <div className="circle circle-3"></div>
                      <div className="circle circle-4"></div>
                    </div>
                  </div>
                  <p className="text-black font-InterBold font-20">
                    Account is verifying...
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-black font-InterBold font-20">
                    Your Account is verified
                  </p>
                  <h1 className="text-black font-InterBold font-40">
                    Thank you
                  </h1>
                  <button
                    onClick={() => history.push("/")}
                    className="btn cus-rotate-btn mt-4"
                  >
                    Start Rotating
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default AccountVerification;
