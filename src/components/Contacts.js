import React, { useState, useEffect } from 'react'
import styles from "./Chat.module.css";
import { init, useLazyQueryWithPagination, fetchQuery, useLazyQuery } from "@airstack/airstack-react";

init("b532399c1dcd475bbeebe849359a9355");

const Contacts = (props) => {
  const [contacts, setContacts] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [results, setResults] = useState([]);
  const [inputValue, setInputValue] = useState("")
  const [iVariables, setIVariables] = useState({
    eventId: ""
  })
  const [variables, setVariables] = useState({
    name: ""
  })
  const [showChat, setShowChat] = useState(true)
  const [loading, setLoading] = useState(true)

  const handleChange = (e) => {
    setInputValue(e.target.value)
    console.log(inputValue)
    setIVariables({ eventId: e.target.value })
    console.log(iVariables)

  }

  const handleSubmit = async () => {
    document.querySelector('#inputField').value = ""
    const res = await fetchPoapHolders(iVariables);
    console.log(res)
    setResults(res)
    setShowChat(false)
  }

  const poapHolders = `query GetAllAddressesSocialsAndENSOfPOAP($eventId: [String!]) {
    PoapEvents(input: {filter: {eventId: {_in: $eventId}}, blockchain: ALL}) {
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
      Poaps(input: {filter: {eventId: {_in: $eventId}}, blockchain: ALL, limit: 10}) {
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
          poapEvent {
            eventId
            city
            country
            description
            endDate
            eventName
            tokenMints
            startDate
          }
          tokenId
        }
      }
    }`;

  const lensQuery = `query LensUser($name: Identity!) {
    Wallet(input: {identity: $name, blockchain: ethereum}) {
      addresses
    }
  }`

  const fcQuery = `query FarcasterUser($name: Identity!)  {
    Wallet(input: {identity: $name, blockchain: ethereum}) {
      addresses
    }
  }`

  const [fetchPoapHolders, { data: poapData, loading: poapLoading, error }] = useLazyQuery(poapHolders, iVariables)

  const [fetchLensUser, { data: lensData, loading: lensLoading, pagination: lensPagination }] = useLazyQueryWithPagination(
    lensQuery, variables
  );

  const [fetchFCUser, { data: fcData, loading: fcLoading, pagination: fcPagination }] = useLazyQueryWithPagination(
    fcQuery, variables
  );

  useEffect(() => {
    resolveContactsAndProfiles();
  }, []);

  const resolveSocial = async (address) => {
    const newQuery = ` 
    query MyQuery {
      Wallet(
        input: {identity: "${address}", blockchain: ethereum}
      ) {
        socials {
          dappName
          profileName
        }        
      }
    }
    `
    const response = await fetchQuery(newQuery)

    if (response.data.Wallet.socials && response.data.Wallet.socials.length > 0) {
      return response?.data?.Wallet?.socials[0].profileName
    }
    return "No web3 profile"
  }

  const resolveContactsAndProfiles = async () => {
    const results = await props.loadConversations()
    let existingContacts = [];
    for (const r of results) {
      existingContacts.push({
        profileName: await resolveSocial(r.peerAddress),
        address: r.peerAddress
      })
      console.log(existingContacts)
    }
    setContacts(existingContacts)
    setLoading(false)
  }

  const goBacktoChats = () => {
    setShowChat(true)
    setResults([])
  }

  const searchForUsers = async function () {
    let res;
    if (profileName.includes(".lens")) {
      res = await fetchLensUser(variables);
    } else {
      res = await fetchFCUser(variables);
    }

    setResults(res?.data?.Wallet?.addresses || []);
  }

  const handleInputChange = (e) => {
    setResults([]);
    setProfileName(e.target.value);
    setVariables({
      name: e.target.value.includes(".lens") ? e.target.value : `fc_fname:${e.target.value}`
    })
  }



  const setContactDetails = (contact) => {
    const clonedContacts = JSON.parse(JSON.stringify(contacts));
    clonedContacts.push(contact);
    setContacts(clonedContacts);
    localStorage.setItem('airstack-contacts', JSON.stringify(clonedContacts));
    localStorage.setItem('airstack-current-contact', JSON.stringify(contact));
    props.setSelectedContact(contact);
    props.setShowContactList(false);
  }

  const selectExistingContact = (contact) => {
    props.setSelectedContact(contact);
    props.setShowContactList(false);
  }

  const SearchResults = () => {
    return (
      <div className={styles.SearchResults}>
        <h3>{profileName}</h3>
        {
          results.map(r => {
            return (
              <div key={r}>
                <button onClick={() => setContactDetails({ profileName, address: r })} key={r}>{r}</button>
              </div>
            )
          })
        }
      </div>
    )
  }

  const event = poapData?.PoapEvents?.PoapEvent ? poapData?.PoapEvents?.PoapEvent[0] : { city: "no event found", country: "" }

  return (
    <div className={styles.Contacts}>

      <div>
        <div className={styles.searchInput}>
          <input type="text" placeholder="POAP Id" id="inputField"
            value={inputValue}
            className={styles.inputField} onChange={handleChange} />

          <button className="m-4 p-2 rounded-xl border border-white" onClick={handleSubmit} >Search</button>
        </div>
      </div>

      {poapLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      {results.data && results.data?.PoapEvents?.PoapEvent && iVariables ? (
        <div>
          <button className={styles.button} onClick={() => { goBacktoChats() }}>back to chats</button>
          <div className={styles.event}>
            <img src={event?.metadata.image_url} />
            <div className={styles.eventDetails}>
              <div style={{ display: 'flex' }}>
                <p><span>ID: </span>{event?.eventId}</p>
                <p><span>City: </span>{event?.city}</p>
                <p><span>Country: </span>{event?.country}</p>
              </div>

              <p className={styles.name}>{event?.eventName}</p>

              <p><span>Description: </span>{event?.description}</p>
              <p><span>Attendies: </span>{event?.tokenMints}</p>
              <div style={{ display: 'flex' }}>
                <p><span>From</span>{event?.startDate.slice(0, 10)}</p>
                <p><span>to</span>{event?.endDate.slice(0, 10)}</p>
              </div>

            </div>
          </div>
          <div className={styles.SearchResults}>
            {
              results.data?.Poaps?.Poap.map((poap) => {
                const address = poap.owner.identity
                return (
                  <div className={styles.box}>

                    <p className={styles.name}>{poap?.owner.identity}</p>

                    <p className={styles.name}>{poap?.owner.primaryDomain?.name}</p>

                    <div>
                      {poap?.owner.socials?.map((social) => {
                        return (
                          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <p><span>{social.dappName}: </span>{social.profileName}</p>
                            
                            {social.profileImage ? <img style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "100%", marginLeft: "10px"}} src={social.profileImage} /> : ""}

                          </div>
                        )
                      })}
                    </div>

                    {
                      poap?.owner.xmtp && poap?.owner.xmtp?.[0].isXMTPEnabled && poap?.owner.socials[0] ?
                        <button className={styles.btn} onClick={() => setContactDetails({ address: address })}>message</button>
                        : <span>  XMTP disabled</span>
                    }
                  </div>
                )
              })
            }

          </div>
        </div>
      ) :
        ""
      }
      {
        showChat ?
          <div className={styles.contacts}>

            {
              loading ? <p>Getting Old Chats......</p>
              :
            contacts?.map((c) => {
              return (
                <div className={styles.contact} onClick={() => selectExistingContact(c)} key={c.address}>
                  <h3>{c.profileName || "No name set"}</h3>
                  <p>{c.address}</p>
                </div>
              )
            })
            }
          </div>
          : ""
      }

    </div>
  )
}

export default Contacts