import React from "react";
import styles from "./Poap.module.css";

import { init, fetchQuery } from "@airstack/airstack-react";
import { useState, useEffect } from "react";

init("b532399c1dcd475bbeebe849359a9355");

const Poap = () => {
  const [poap, setPoap] = useState([]);
  const [events, setEvents] = useState([]);
  const [showPoaps, setShowPoaps] = useState(true);

  useEffect(() => {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let pastMonth = date.getMonth();
    let year = date.getFullYear();

    let before = `${year}-${pastMonth}-${day}`;
    let today = `${year}-${month}-${day}`;
    console.log(before, today);
    getPoaps(before, today);
  }, []);

  const getPoapEvent = async (eventId) => {
    const query = `
    query MyQuery {
      PoapEvents(input: {filter: { eventId: { _in: ["${eventId}"] } }, blockchain: ALL}) {
        PoapEvent {
          city
          eventId
          description
          endDate
          eventName
          startDate
          tokenMints
          country
          metadata
        }
      }
      Poaps(
        input: {
          filter: { eventId: { _in: ["${eventId}"] } }
          blockchain: ALL
          limit: 200
        }
      ) {
        Poap {
          owner {
            identity
            primaryDomain {
              name
            }
            domains {
              name
            }
            socials {
              profileName
              dappName
              dappSlug
              profileImage
              profileUrl
            }
            xmtp {
              isXMTPEnabled
            }
          }
          tokenId
        }
        pageInfo {
          nextCursor
          prevCursor
        }
      }
    }`; // Replace with GraphQL Query

    const { data, loading, error } = await fetchQuery(query);
    setEvents(data);
    setShowPoaps(false);
  };
  console.log(events);

  const event = events.PoapEvents?.PoapEvent[0];

  const getPoaps = async (before, today) => {
    const query = `
        query MyQuery {
            PoapEvents(
              input: {
                filter: { startDate: { _gte: "${before}", _lt: "${today}" } }
                blockchain: ALL
                limit: 100
              }
            ) {
              PoapEvent {
                eventName
                eventId
                startDate
                endDate
                country
                city
                isVirtualEvent
                contentValue {
                  image {
                    extraSmall
                    large
                    medium
                    original
                    small
                  }
                }
              }
              pageInfo {
                nextCursor
                prevCursor
              }
            }
          }`; // Replace with GraphQL Query

    const { data, loading, error } = await fetchQuery(query);
    setPoap(data.PoapEvents.PoapEvent);
  };
  console.log(poap);

  return (
    <div className={styles.main}>
      {showPoaps ? (
        <>
          <h3 style={{ marginLeft: "30px" }}>Recent Poaps</h3>
          <div className={styles.poaps}>
            {poap.map((event, index) => {
              return (
                <div
                  onClick={() => getPoapEvent(event.eventId)}
                  className={styles.poap}
                  key={event.eventId}
                >
                  <img
                    className={styles.image}
                    src={event.contentValue?.image?.medium}
                    alt="profile"
                  />
                  <h3
                    style={{
                      marginLeft: "10px",
                      position: "absolute",
                      top: "30vh",
                    }}
                  >
                    #{event.eventId}
                  </h3>
                  <h4
                    style={{
                      marginLeft: "10px",
                      textAlign: "start",
                      color: "#555",
                      position: "absolute",
                      top: "35vh",
                    }}
                  >
                    {event.eventName}
                  </h4>
                  {event.isVirtualEvent ? (
                    <h3
                      style={{
                        marginLeft: "10px",
                        textAlign: "start",
                        color: "#555",
                        position: "absolute",
                        top: "50vh",
                      }}
                    >
                      Virtual Event
                    </h3>
                  ) : (
                    <h3
                      style={{
                        marginLeft: "10px",
                        textAlign: "start",
                        color: "#555",
                        position: "absolute",
                        top: "50vh",
                      }}
                    >
                      {event.city}, {event.country}
                    </h3>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <button className={styles.btn} onClick={() => setShowPoaps(true)}>
            back to Poaps
          </button>

          <div className={styles.event}>
            <img src={event?.metadata.image_url} />
            <div className={styles.eventDetails}>
              <div style={{ display: "flex" }}>
                <p>
                  <span>ID: </span>
                  {event?.eventId}
                </p>
                <p>
                  <span>City: </span>
                  {event?.city}
                </p>
                <p>
                  <span>Country: </span>
                  {event?.country}
                </p>
              </div>

              <p className={styles.Ename}>{event?.eventName}</p>

              <p>
                <span>Description: </span>
                {event?.description.substr(0, 300)}........
              </p>
              <p>
                <span>Attendies: </span>
                {event?.tokenMints}
              </p>
              <div style={{ display: "flex" }}>
                <p>
                  <span>From</span>
                  {event?.startDate.slice(0, 10)}
                </p>
                <p>
                  <span>to</span>
                  {event?.endDate.slice(0, 10)}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.SearchResults}>
            {events?.Poaps?.Poap.map((poap, index) => {
              return (
                <div key={index} className={styles.box}>
                  <p className={styles.id}>{poap?.owner.identity}</p>
                  <p className={styles.name}>
                    {poap?.owner.primaryDomain?.name}
                  </p>

                  <div>
                    {poap?.owner.socials?.map((social, index) => {
                      let url = "";
                      if (
                        social?.profileImage.includes("https://ipfs.infura.io")
                      ) {
                        url = "https://ipfs.io".concat(
                          social.profileImage.slice(22),
                        );
                      } else if (social?.profileImage.includes("ipfs")) {
                        url = "https://ipfs.io/ipfs/".concat(
                          social.profileImage.slice(7),
                        );
                      } else {
                        url = social.profileImage;
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          {social.profileImage ? (
                            <img
                              alt="profile"
                              className={styles.profile}
                              src={url}
                            />
                          ) : (
                            <img
                              alt="profile"
                              className={styles.profile}
                              src="/pepe.gif"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Poap;
