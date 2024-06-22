import React, { useEffect, useState, useContext, useParams } from "react";
import {Router, Switch, Route, Link } from 'react-router-dom';
import PopupWindow from "../auth/PopupWindow";
import Portal from "../../Util/Portal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import Invoice from "./Invoice";
import Searchbar from "./Searchbar";
import axios from "axios";
import Cookies from "js-cookie";
import './wallet.css'

const BACKEND = process.env.REACT_APP_BACKEND;

const Wallet = () => {

    const [invoices, setInvoices] = useState([]);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [shareIndex, setShareIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [currInvoice, setCurrInvoice] = useState(null);

    let data;
    try {
        data = JSON.parse(Cookies.get('data'));
    } catch (e) {
        console.log("error parsing cookie: ", e);
        data = {};
    }

    const handleSearchResults = (results) => {
        setInvoices(results)
    }

    const toggleDropdown = (index) => {
        if(dropdownIndex === index) {
            setDropdownIndex(null);
        } else {
            setDropdownIndex(index);
        }
    }

    const togglePopupShare = (index) => {
        if(shareIndex === index) {
            setShareIndex(null);
        } else {
            setShareIndex(index);
        }
    }

    const togglePopupDelete = (index) => {
        if(deleteIndex === index) {
            setDeleteIndex(null);
        } else {
            setDeleteIndex(index);
        }
    }

    const editReceipt = (action, invoiceID, recipientID, sharedWith='', itemName='', returner='') => {
        const token = Cookies.get('token');
        console.log(sharedWith);
        axios
        .post(
            BACKEND+'/edit/',
            {
              action: action,
              invoiceID: invoiceID,
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

    const fetchData = () => {
        const token = Cookies.get('token');
        axios.get(BACKEND+'/get/', {
            headers: {
                'Authorization': "Token " + token
            }
        })
        .then((response) => {
            console.log(response);
            setInvoices(response.data.invoices);
        })
        .catch((error) => {
            console.error('error: ', error);
        });
    }

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


export default Wallet;
