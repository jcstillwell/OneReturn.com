import React, { useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Searchbar from '../UI-Reusable/Searchbar.js';
import Invoice from "./Invoice";
import "./css/console.css"
//WORK IN PROGRESS
const BACKEND = process.env.REACT_APP_BACKEND;

const MerchantConsole = () => {

    const [invoices, setInvoices] = useState([]);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [shareIndex, setShareIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [currInvoice, setCurrInvoice] = useState(null);

    const handleSearchResults = (results) => {
        setInvoices(results);
    };

    const toggleDropdown = (index) => {
        if (dropdownIndex === index) {
            setDropdownIndex(null);
        } else {
            setDropdownIndex(index);
        }
    };

    const togglePopupShare = (index) => {
        if (shareIndex === index) {
            setShareIndex(null);
        } else {
            setShareIndex(index);
        }
    };

    const togglePopupDelete = (index) => {
        if (deleteIndex === index) {
            setDeleteIndex(null);
        } else {
            setDeleteIndex(index);
        }
    };

    const editReceipt = (action, invoiceID, recipientID, sharedWith = '', itemName = '', returner = '') => {
        const token = Cookies.get('token');
        console.log(sharedWith);
        axios
            .post(
                BACKEND + '/edit/',
                {
                    action: action,
                    invoiceID: invoiceID,
                    recipientID: recipientID,
                    sharedWith: sharedWith,
                    itemName: itemName,
                    returner: returner,
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
                console.log("current version updated");
            })
            .catch((error) => {
                console.error('error: ', error);
            });
    };

    const fetchData = () => {
        const token = Cookies.get('merchant-auth-token');
        console.log(token);
        //first call to fetch account data securely.
        axios.get(BACKEND + '/retrieveaccdata/', {
            headers: {
                'Authorization': "Token " + token
            },
        })
            .then((response) => {
                console.log(response);
                //second call to fetch invoice data.
                axios.get(BACKEND + '/getmerchant/', {
                    headers: {
                        'Authorization': "Token " + token
                    },
                    params: {
                        'api_key': response.data.api_key,
                    }
                })
                    .then((response) => {
                        console.log(response);
                        setInvoices(response.data.invoices);
                    })
                    .catch((error) => {
                        console.error('error: ', error);
                    });
            })
            .catch((error) => {
                console.error('error: ', error);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (invoices.length > 0) {
            setCurrInvoice(invoices[0].invoice.invoiceID);
        }
     }, [invoices]);

    const setInvoiceFocus = (invoiceID) => {
        setCurrInvoice(invoiceID);
        console.log("set: " + invoiceID);
        console.log("curr: " + currInvoice)
    }

    return (
        <div className="main-container">
            <div className="searchbar-container">
                <Searchbar onSearch={handleSearchResults}/>
            </div>
            <div className="invoices-nondetailed-list">
                {!invoices || invoices.length === 0 ? (
                    <div className="ndinvoicebox">
                    <p>No receipts found</p>
                    </div>
                ) : (
                    invoices.map((invoice, index) => (
                    <div className='ndinvoicebox' key={index} onClick={() => setInvoiceFocus(invoice.invoice.invoiceID)}>
                        {console.log(invoice.invoice.invoiceID)}
                        <h2>{invoice.invoice.invoiceID}</h2>
                    </div>
                    ))
                )}
            </div>
            <div className="invoice-detailed">
                {currInvoice && <Invoice invoiceID={currInvoice}/> }
            </div>
        </div>
        );
}

export default MerchantConsole;
