import React from "react";
import { useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import "/public/styles.css";
import { useTranslation } from "../common/components/LocalizationProvider";

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
  const t = useTranslation();
  const classes = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {!useMediaQuery(theme.breakpoints.down("lg")) && (
          <h1 style={{ textAlign: "center" }} dangerouslySetInnerHTML={{__html: t('termsPrivacyPolicy')}}>
            {/* {t("termsPrivacyPolicy")} */}
            {/* User Terms <br /> and <br /> Privacy Policy */}
          </h1>
        )}
      </div>
      <div className={classes.topbar}>
        {useMediaQuery(theme.breakpoints.down("lg")) && (
          <h1 style={{ textAlign: "center" }}>{t("termsPrivacyPolicy")}</h1>
        )}
      </div>
      <div className="section">
        <h2>{t("userTerms")}</h2>
        <p>{t("userTermsHeading")}</p>
        <ul>
          <li>
            <p>
              <strong>1. {t("userTermsFirstHeading")}: </strong>
              {t("userTermsParaFirst")}
            </p>
          </li>
          <li>
            <p>
              <strong>2. {t("userTermsSecondHeading")}: </strong>
              {t("userTermsParaSecond")} 
            </p>
          </li>
          <li>
            <p>
              <strong>3. {t("userTermsThirdHeading")}: </strong> 
              {t("userTermsParaThird")}
            </p>
          </li>
          <li>
            <p>
              <strong>4. {t("userTermsFourthHeading")}: </strong>
              {t("userTermsParaFourth")} 
            </p>
          </li>
          <li>
            <p>
              <strong>5. {t("userTermsFifthHeading")}: </strong> 
              {t("userTermsParaFifth")}
            </p>
          </li>
          <li>
            <p>
              <strong>6. {t("userTermsSixHeading")}: </strong>
              {t("userTermsParaSix")} 
            </p>
          </li>
          <li>
            <p>
              <strong>7. {t("userTermsSevenHeading")}: </strong> 
              {t("userTermsParaSeven")}
            </p>
          </li>
          <li>
            <p>
              <strong>8. {t("userTermsEightHeading")}: </strong> 
              {t("userTermsParaEight")}
            </p>
          </li>
          <li>
            <p>
              <strong>9. {t("userTermsNineHeading")}: </strong> 
              {t("userTermsParaNine")}
            </p>
          </li>
        </ul>

        <h2 style={{ marginTop: "50px" }}>{t("privacyPolicy")}</h2>
        <p>
        {t("privacyPolicyHeading")}
        </p>
        <ul>
          <li>
            <p>
              <strong>1. {t("privacyPolicyFirstHeading")}: </strong>
              {t("privacyPolicyParaFirst")} 
            </p>
          </li>
          <li>
            <p>
              <strong>2. {t("privacyPolicySecondHeading")}: </strong> 
              {t("privacyPolicyParaSecond")}
            </p>
          </li>
          <li>
            <p>
              <strong>3. {t("privacyPolicyThirdHeading")}: </strong> 
              {t("privacyPolicyParaThird")}
            </p>
          </li>
          <li>
            <p>
              <strong>4. {t("privacyPolicyFourthHeading")}: </strong> 
              {t("privacyPolicyParaFourth")}
            </p>
          </li>
          <li>
            <p>
              <strong>5. {t("privacyPolicyFifthHeading")}: </strong> 
              {t("privacyPolicyParaFifth")}
            </p>
          </li>
          <li>
            <p>
              <strong>6. {t("privacyPolicySixHeading")}: </strong> 
              {t("privacyPolicyParaSix")}
            </p>
          </li>
          <li>
            <p>
              <strong>7. {t("privacyPolicySevenHeading")}: </strong> 
              {t("privacyPolicyParaSeven")}
            </p>
          </li>
          <li>
            <p>
              <strong>8. {t("privacyPolicyEightHeading")}: </strong> 
              {t("privacyPolicyParaEight")}
            </p>
          </li>
          <li>
            <p>
              <strong>9. {t("privacyPolicyNineHeading")}: </strong> 
              {t("privacyPolicyParaNine")}
            </p>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
