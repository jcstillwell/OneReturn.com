import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./css/console.css";

const BACKEND = process.env.REACT_APP_BACKEND;

const Account = ({accountID}) => {
    
    const [accounts, setAccounts] = useState([]);
    const [historyPage, setPage] = useState(false)


    let data;
    try {
        data = JSON.parse(Cookies.get('data'));
    } catch (e) {
        console.log("error parsing cookie: ", e);
        data = {};
    }

    const editReceipt = (action, accountID, recipientID, sharedWith='', itemName='', returner='') => {
        const token = Cookies.get('merchant-auth-token');
        console.log(sharedWith);
        axios
        .post(BACKEND+'/edit/',
            {
              action: action,
              accountID: accountID,
              recipientID: recipientID,
              sharedWith: sharedWith,
              itemName: itemName,
              returner: returner
            },
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          )
          .then((response) => {
            console.log(response);
            fetchData();
            console.log("current version updated")
          })
          .catch((error) => {
            console.error('error: ', error);
          });
      };


    const fetchData = (accountID) => {
        const token = Cookies.get('merchant-auth-token');
        axios.get(BACKEND+'/retrieveaccdata/', {
            headers: {
                'Authorization': "Token " + token
            }
        })
        .then((response) => {
            console.log(response);
            axios.get(BACKEND+'/getmerchant/', {
                params: {
                    'method': 'SINGLE',
                    'query': accountID,
                    'api_key': response.data.api_key,
                },
                headers: {
                    'Authorization': "Token " + token
                }
                })
                .then((response) => {
                    console.log(response);
                    setAccounts(response.data.accounts)
                })
                .catch((error) => {
                    console.error('error: ', error);
                });
        })
        .catch((error) => {
            console.error('error: ', error);
        });
    }

    useEffect(() => {
        fetchData(accountID);
     }, [accountID]);
      
     return (
        <div className="account-container">
            {accounts.map((account, index) => (
                <React.Fragment key={index}>
                    <div className="detailed-account-info">
                        <h2 className="account-id-label">Invoice ID: {account.account.accountID}</h2>
                        <h3>Merchant ID: {account.account.merchantID}</h3>
                        <h3>Merchant Address: {account.account.merchantAddress}</h3>
                        <h3>Merchant Store/Location Number: {account.account.merchantLocNumber}</h3>
                        <h3>Recipient ID: {account.account.recipientID}</h3>
                    </div>
                    <div className="buttons-container">
                        <button id="toggle-button" onClick={() => setPage(false)}>Items</button>
                        <button id="toggle-button" onClick={() => setPage(true)}>History</button>
                    </div>
                    {!historyPage && (
                            <div className="item-list-container-expanded">
                                <div className="item-list-expanded">
                                    <h2>Items:</h2>
                                    <div id="items">
                                        {account.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="ind-item-block">
                                                <h3>{item.name}: ${item.price}</h3>
                                                {item.returned && (
                                                    <div>
                                                        <p className="returned-label">RETURNED</p>
                                                        <p className="returned-funds">-{item.price}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                    )}
                </React.Fragment>
            ))}
                    {historyPage && ( 
                        <div className="transaction-history-container">
                            <h2>History:</h2>
                            <div id="items">
                                {accounts[0]?.account.transactionHistory.map((i, iIndex) => (
                                    <div key={iIndex}>
                                        <h3 className="ind-item-block">{i}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );    
}

export default Account;
