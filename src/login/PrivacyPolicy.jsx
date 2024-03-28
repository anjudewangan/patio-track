import React from "react";
import { useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import "../../public/styles.css";

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("lg")]: {
      display: "block",
      height: "100%",
    },
    display: "flex",
  },
  sidebar: {
    position: "sticky",
    top: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#D60024",
    height: "100vh",
    // [theme.breakpoints.up("lg")]: {
    //   paddingBottom: theme.spacing(5),
    // },
    [theme.breakpoints.down("md")]: {
      paddingTop: "0",
      height: "0",
    },

    width: theme.dimensions.sidebarWidth,
    [theme.breakpoints.down("lg")]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down("sm")]: {
      width: "0px",
    },
    color: theme.palette.headingColor.main,
  },
  topbar: {
    justifyContent: "center",
    alignItems: "center",
    background: "#D60024",
    [theme.breakpoints.down("lg")]: {
      width: "100%",
      height: "30%",
      display: "flex",
    },
  },
}));

const PrivacyPolicy = () => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {!useMediaQuery(theme.breakpoints.down("lg")) && (
          <h1 style={{ textAlign: "center" }}>
            User Terms <br /> and <br /> Privacy Policy
          </h1>
        )}
      </div>
      <div className={classes.topbar}>
        {useMediaQuery(theme.breakpoints.down("lg")) && (
          <h1 style={{ textAlign: "center" }}>
            User Terms <br /> and <br /> Privacy Policy
          </h1>
        )}
      </div>
      <div className="section">
        <h2>User Terms</h2>
        <p>
          Welcome to Patio Track! By accessing or using our services, you agree
          to be bound by these User Terms.
        </p>
        <ul>
          <li>
            <p>
              <strong>1. User Eligibility:</strong> You must be at least 18
              years old to use our services. By using our services, you confirm
              that you are of legal age to form a binding contract.
            </p>
          </li>
          <li>
            <p>
              <strong>2. License to Use:</strong> We grant you a limited,
              non-exclusive, non-transferable license to use our app for
              personal or commercial purposes, subject to these User Terms.
            </p>
          </li>
          <li>
            <p>
              <strong>3. User Conduct:</strong> You agree not to violate any
              laws or regulations, use our services for any illegal or
              unauthorized purpose, or interfere with the integrity or
              performance of our services.
            </p>
          </li>
          <li>
            <p>
              <strong>4. Intellectual Property Rights:</strong> All content and
              materials available through our services are protected by
              copyright and other intellectual property laws.
            </p>
          </li>
          <li>
            <p>
              <strong>5. Limitation of Liability:</strong> We are not liable for
              any damages or losses arising out of your use of our services.
            </p>
          </li>
          <li>
            <p>
              <strong>6. Termination:</strong> We reserve the right to suspend
              or terminate your access to our services at any time, without
              prior notice, for any reason or no reason.
            </p>
          </li>
          <li>
            <p>
              <strong>7. Governing Law:</strong> These User Terms are governed
              by and construed in accordance with the laws of India.
            </p>
          </li>
          <li>
            <p>
              <strong>8. Changes to User Terms:</strong> We reserve the right to
              modify or update these User Terms at any time. You are responsible
              for regularly reviewing the latest version.
            </p>
          </li>
          <li>
            <p>
              <strong>9. Contact Us:</strong> If you have any questions or
              concerns about these User Terms, please contact us at
              support@patiotrack.in.
            </p>
          </li>
        </ul>

        <h2 style={{ marginTop: "50px" }}>Privacy Policy</h2>
        <p>
          Your privacy matters to us. We collect only necessary information to
          provide and improve our services, ensuring your data is safeguarded at
          all times.
        </p>
        <ul>
          <li>
            <p>
              <strong>1. Information We Collect:</strong> We collect personal
              information such as your name, email address, and location data
              when you use our app. We may also collect device information, log
              data, and usage statistics.
            </p>
          </li>
          <li>
            <p>
              <strong>2. How We Use Your Information:</strong> We use your
              information to provide, maintain, and improve our services,
              communicate with you, and personalize your experience. We may also
              use your information for marketing and analytics purposes.
            </p>
          </li>
          <li>
            <p>
              <strong>3. Information Sharing:</strong> We may share your
              information with third-party service providers, business partners,
              or affiliates for purposes such as data processing, analytics, or
              marketing. We will not sell or rent your information to third
              parties without your consent.
            </p>
          </li>
          <li>
            <p>
              <strong>4. Data Security:</strong> We take reasonable measures to
              protect your information from unauthorized access, use, or
              disclosure. However, no method of transmission over the internet
              or electronic storage is 100% secure.
            </p>
          </li>
          <li>
            <p>
              <strong>5. Your Choices:</strong> You can access, update, or
              delete your personal information through your account settings.
              You may also opt out of receiving marketing communications from
              us.
            </p>
          </li>
          <li>
            <p>
              <strong>6. Children's Privacy:</strong> Our services are not
              intended for children under the age of 13. We do not knowingly
              collect or solicit personal information from children.
            </p>
          </li>
          <li>
            <p>
              <strong>7. International Data Transfers:</strong> Your information
              may be transferred to and processed in countries other than your
              own, where data protection laws may be different.
            </p>
          </li>
          <li>
            <p>
              <strong>8. Changes to Privacy Policy:</strong> We reserve the
              right to modify or update this Privacy Policy at any time. We will
              notify you of any material changes by posting the updated policy
              on our website or app.
            </p>
          </li>
          <li>
            <p>
              <strong>9. Contact Us:</strong> If you have any questions or
              concerns about this Privacy Policy, please contact us at
              support@patiotrack.in.
            </p>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
