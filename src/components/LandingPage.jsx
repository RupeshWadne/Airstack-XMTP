import React from 'react'
import styles from "./landing.module.css"
import { ConnectWallet } from "@thirdweb-dev/react";

const LandingPage = () => {
    return (
        <div className={styles.thirdWeb}>
          <ConnectWallet />
        </div>
    )
}

export default LandingPage
