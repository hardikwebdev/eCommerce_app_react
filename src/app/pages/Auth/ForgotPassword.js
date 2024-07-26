import React, { Fragment, useState, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import CmtInputBox from "../../../components/Common/CmtInputBox";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { forgotPassword } from "../../crud/auth.crud";
import { CircularProgress } from "@material-ui/core";
import { showToast } from "../../../utils/utils";

const ValidationSchema = Yup.object().shape({
  email: Yup.string()
    .trim(" ")
    .required("Please provide email address")
    .email("Invalid Email"),
});

function ForgotPassword(props) {
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const history = useHistory();

  const handleForgotPassword = (values) => {
    setLoading(true);
    forgotPassword(values.email)
      .then((result) => {
        // showToast("success", result.data.message);
        setShowThankYou(true);
      })
      .catch((errors) => {
        setLoading(false);
        // showToast("error", errors);
        setErrorMsg(errors.response.data.message);
      });
  };

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
      <section className="bg-light-gray auth-min-height">
        <div className="container py-5">
          <div className="row justify-content-center">
            {!showThankYou ? (
              <div className="col-12 col-lg-6">
                <Formik
                  initialValues={{
                    email: "",
                  }}
                  validationSchema={ValidationSchema}
                  onSubmit={(values) => {
                    handleForgotPassword(values);
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleSubmit,
                    handleChange,
                    handleBlur,
                  }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-2 text-center">
                          <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                            Forgot password?
                          </h1>
                          <p className="font-18 text-black-3 font-InterLight">
                            No worries, we’ll send you reset instructions
                          </p>
                        </div>
                        <div className="mb-3">
                          <CmtInputBox
                            name={"email"}
                            value={values.email}
                            handleChange={(e) => {
                              handleChange(e);
                              setErrorMsg("");
                            }}
                            handleBlur={handleBlur}
                            type={"email"}
                            placeholder="Email"
                          />
                          <div className="text-danger">
                            {touched.email && errors.email}
                          </div>
                        </div>
                        <div className="mb-3 text-center">
                          <button type="submit" className="btn cus-auth-btn">
                            {!loading ? "RESET PASSWORD" : <CircularProgress />}
                          </button>
                          <div className="text-danger mt-2">{errorMsg}</div>
                        </div>
                        <div className="text-center">
                          <Link
                            to="/account/login"
                            className="text-brown font-InterRegular font-20 text-decoration-none"
                          >
                            Back to Log in
                          </Link>
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </div>
            ) : (
              <div className="col-12 col-lg-5">
                <div className="mb-2 text-center">
                  <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                    Forgot password?
                  </h1>
                  <p className="font-18 text-black-3 font-InterLight mt-4">
                    Thank you! If an account exists with that email, we will
                    send you an email to reset your password!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default ForgotPassword;
