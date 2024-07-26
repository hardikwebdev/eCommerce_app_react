import React from "react";
import Helmet from "react-helmet";

const TitleComponent = ({ title, icon }) => {
  var defaultTitle = "E-Commerce";
  return (
    <Helmet>
      <link rel="apple-touch-icon" href={icon} />
      <title>{title ? "E-Commerce | " + title : defaultTitle}</title>
    </Helmet>
  );
};

export default TitleComponent;
