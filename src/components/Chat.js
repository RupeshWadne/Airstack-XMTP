import React, { useState, useEffect } from "react";
import styles from "./Chat.module.css";
import Image from "next/image"
import Loading from "./Loading";
import { useAddress } from "@thirdweb-dev/react";
import { init, useLazyQueryWithPagination, fetchQuery, useLazyQuery } from "@airstack/airstack-react";

init("b532399c1dcd475bbeebe849359a9355");

function Chat({ client, messageHistory, conversation, setShowContactList, selectedContact, user, loadingx, setLoadingx }) {
  const address = useAddress();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setLoadingx(false)
  }, [user])

  console.log(user)

  // Function to handle sending a message
  const handleSend = async () => {
    if (inputValue) {
      await onSendMessage(inputValue);
      setInputValue("");
    }
  };

  // Function to handle sending a text message
  const onSendMessage = async (value) => {
    return conversation.send(value);
  };

  // MessageList component to render the list of messages
  const MessageList = ({ messages }) => {
    // Filter messages by unique id
    messages = messages.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
    );

    const getUserName = (message) => {
      if (message.senderAddress === address) {
        return "You"
      } else if (selectedContact && selectedContact.profileName !== "No web3 profile") {
        return selectedContact.profileName
      } else if (selectedContact && selectedContact.address) {
        return selectedContact.address
      } else {
        return
      }
    }

    return (
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div key={index} className={getUserName(message) === "You" ? styles.message : styles.msg}>
            <div
              key={message.id}
              className={getUserName(message) === "You" ? styles.you : styles.other}
            >
              {/* <strong>
              {getUserName(message)}:
            </strong> */}
              <span className={styles.texts}>{message.content}</span>
              {/* <span style={{fontSize: "10px", fontWeight: "100", color: "#1f1f1f"}}> ({message.sent.toLocaleTimeString()})</span> */}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to handle input change (keypress or change event)
  const handleInputChange = (event) => {
    if (event.key === "Enter") {
      handleSend();
    } else {
      setInputValue(event.target.value);
    }
  };

  let url = ""
  if (user.socials && user?.socials[0]?.profileImage.includes("https://ipfs.infura.io")) {
    url = "https://ipfs.io".concat(user?.socials[0]?.profileImage.slice(22))
  } else if (user.socials && user?.socials[0]?.profileImage.includes("ipfs")) {
    url = "https://ipfs.io/ipfs/".concat(user?.socials[0]?.profileImage.slice(7))
  } else if (user.socials && user?.socials[0]?.profileImage) {
    url = user?.socials[0]?.profileImage
  } else {
    url
  }

  return (
    <>
      <div className={styles.Chat}>
        {loadingx ? <Loading /> :
          <>
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%", margin: "auto", border: "1px solid gray", borderTopLeftRadius: "30px", borderTopRightRadius: "30px", backgroundColor: "#F5F5F5" }}>
              {url ?
                <>
                  <img
                    alt="profile"
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "100%", margin: "10px", border: "2px solid black" }}
                    src={url}
                  />
                  <p style={{ paddingLeft: "20px" }}>{selectedContact && user.socials && user?.socials[0]?.profileDisplayName}</p>
                </> : <img
                  alt="profile"
                  style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "100%", margin: "10px", border: "2px solid black" }}
                  src="/user.png"
                />
              }
            </div>
            {
              user.socials && user?.socials[0]?.profileDisplayName || selectedContact && selectedContact.address ?
                <div className={styles.messageContainer}>
                  <MessageList messages={messageHistory} />
                </div> :
                <div style={{ width: "100%", flex: "1" }}></div>
            }

            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.inputField}
                onKeyPress={handleInputChange}
                onChange={handleInputChange}
                value={inputValue}
                placeholder="Type your message here "
              />
              <button className={styles.sendButton} onClick={handleSend}>
                Send
              </button>
            </div>
          </>
        }
      </div>
      <div className={styles.info}>
        {url ?
          <>
            <img
              alt="profile"
              className={styles.hero}
              src={url}
            />

          </> : <img
            alt="profile"
            className={styles.hero}
            src="/user.png"
          />
        }
        <h4>
          {user.primaryDomain?.name}
        </h4>
        {/* {
          <div>
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%", paddingLeft: "20px" }}>

                <p style={{width: "80px", backgroundColor: "#1f1f1f", color: "#fff", borderRadius: "10px"}}>{user.socials && user.socials[0]?.dappName} </p>
                <p>{user.socials && user.socials[0]?.profileDisplayName}</p>

              </div>
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%", paddingLeft: "20px" }}>

              <p style={{width: "80px", backgroundColor: "#1f1f1f", color: "#fff", borderRadius: "10px"}}>{user.socials && user.socials[1]?.dappName}</p>
              <p>{user.socials && user.socials[1]?.profileDisplayName}</p>

            </div>
            </div>
        } */}
        <div>
        <h3 style={{textAlign: "center"}}>POAPs</h3>
        <div className={styles.grid}>
          {
            user.poaps && user.poaps.map((poap) => {
              return(
                <div key={poap.eventId} className={styles.poap}>
                  <a href={poap.tokenUri} target="_blank">
                  <img style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "100%"}} src={poap.poapEvent.metadata.image_url} /></a>
                <p>{poap.eventId}</p>
                <h5>{poap.poapEvent.metadata.name}</h5>
                </div>
              )
            })
          }
        </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
