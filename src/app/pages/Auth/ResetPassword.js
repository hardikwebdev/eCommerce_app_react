import React, { Fragment, useState, createRef, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import CmtInputBox from "../../../components/Common/CmtInputBox";
import ReCAPTCHA from "react-google-recaptcha";
import queryString from "query-string";
import { Formik } from "formik";
import * as Yup from "yup";
import { useHistory, Link } from "react-router-dom";
import { changePassword } from "../../crud/auth.crud";
import {
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { showToast } from "../../../utils/utils";

const grecaptchaObject = window.grecaptcha;

const ValidationSchema = Yup.object().shape({
  password: Yup.string()
    .trim(" ")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password not matched")
    .required("ConfirmPassword is Required"),
  captcha_token: Yup.string().required("You must verify the captcha"),
});

function ResetPassword(props) {
  const [loading, setLoading] = useState(false);

  const [isChecked, setIsChecked] = useState(false);

  const history = useHistory();

  const reCaptchaRef = createRef();

  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const queryValues =
    props.location && queryString.parse(props.location.search);

  const handleResetPassword = (values) => {
    changePassword(queryValues, values.password, values.captcha_token)
      .then((result) => {
        setLoading(true);
        setTimeout(() => {
          history.push("/logout");
        }, 1000);
      })
      .catch((errors) => {
        reCaptchaRef.current.reset();
        let message = "";
        if (Array.isArray(errors.response.data.message)) {
          message = errors.response.data?.message[0]?.msg;
        } else {
          message = errors.response.data.message;
        }
        setErrorMsg(message);
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
    let curEmail = queryValues.email;
    let indexOf = curEmail.indexOf("@");
    curEmail = curEmail.slice(indexOf);
    setCurrentEmail(curEmail);

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
            <div className="col-12 col-lg-6">
              <Formik
                initialValues={{
                  password: "",
                  confirmPassword: "",
                  captcha_token: "",
                }}
                validationSchema={ValidationSchema}
                onSubmit={(values) => {
                  handleResetPassword(values);
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4 text-center">
                        <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                          Reset Account Password
                        </h1>
                        <p className="font-18 text-black-3 font-InterLight">
                          Enter a new password for ***********{currentEmail}
                        </p>
                      </div>
                      <div className="mb-2 position-relative">
                        <span
                          className="password-eye"
                          onClick={(e) => {
                            setIsVisible(!isVisible);
                          }}
                        >
                          {isVisible ? (
                            <img
                              src={"/media/images/password-eye-open.png"}
                              className="img-fluid"
                            />
                          ) : (
                            <img
                              src={"/media/images/password-eye.png"}
                              className="img-fluid"
                            />
                          )}
                        </span>
                        <CmtInputBox
                          name={"password"}
                          value={values.password}
                          handleChange={(e) => {
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          type={isVisible ? "text" : "password"}
                          placeholder="New Password"
                        />
                        <div className="text-danger">
                          {touched.password && errors.password}
                        </div>
                      </div>
                      <div className="mb-2 position-relative">
                        <span
                          className="password-eye"
                          onClick={(e) => {
                            setIsVisible2(!isVisible2);
                          }}
                        >
                          {isVisible2 ? (
                            <img
                              src={"/media/images/password-eye-open.png"}
                              className="img-fluid"
                            />
                          ) : (
                            <img
                              src={"/media/images/password-eye.png"}
                              className="img-fluid"
                            />
                          )}
                        </span>
                        <CmtInputBox
                          name={"confirmPassword"}
                          value={values.confirmPassword}
                          handleChange={(e) => {
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          type={isVisible2 ? "text" : "password"}
                          placeholder="Confirm Password"
                        />
                        <div className="text-danger">
                          {touched.confirmPassword && errors.confirmPassword}
                        </div>
                      </div>
                      {/* <div className="mb-3">
                      <FormGroup className="cus-checkbox auth-checkbox">
                        <FormControlLabel control={<Checkbox />} label={"Remember me"} checked={isChecked} onChange={(e) => {
                          setIsChecked(!isChecked)
                        }} />
                      </FormGroup>
                    </div> */}
                      <div className="mb-4">
                        <ReCAPTCHA
                          onChange={(captcha_token) => {
                            setFieldValue("captcha_token", captcha_token);
                          }}
                          ref={reCaptchaRef}
                          onReset={() => setFieldValue("captcha_token", "")}
                          onExpired={() => setFieldValue("captcha_token", "")}
                          grecaptcha={grecaptchaObject}
                          className="captcha-shadow"
                          sitekey={process.env.REACT_APP_SITE_KEY}
                        />
                        <div className="text-danger">
                          {touched.captcha_token && errors.captcha_token}
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
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default ResetPassword;
