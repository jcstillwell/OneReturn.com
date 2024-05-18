import React, { useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Searchbar from '../UI-Reusable/Searchbar.js';
import Portal from '../UI-Reusable/Portal.js';
import PopupWindow from '../UI-Reusable/PopupWindow.js';
//WORK IN PROGRESS
const BACKEND = process.env.REACT_APP_BACKEND;

const MerchantConsole = () => {

    const [invoices, setInvoices] = useState([]);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [shareIndex, setShareIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [api_key, setAPIKey] = useState(null);
    const [merchantID, setMerchantID] = useState(null);

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

    return (
        <div>
            <div className="searchbar-container">
                <Searchbar onSearch={handleSearchResults} />
            </div>
            {
                (!invoices || invoices.length === 0) ? (
                    <div id='no-invoice'>
                        <p>Looks like you haven't issued any receipts yet.</p>
                        <a href='https://api.onereturn.com'>Get started.</a>
                        <a href='https://api.onereturn.com'>Report an issue.</a>
                    </div>
                ) : (
                    <div className="invoiceContainer">
                        {invoices.map((invoice, index) => {
                            return (
                                <div className='invoiceBox' key={index}>
                                    {deleteIndex === index && (
                                        <Portal>
                                            <PopupWindow label='Are you sure you want to delete this receipt?' buttonLeft='Cancel' buttonRight='Confirm'
                                                confirm={() => editReceipt('DELETE', invoice.invoice.invoiceID, invoice.invoice.recipientID)} toggleVisibility={() => togglePopupDelete()} />
                                        </Portal>
                                    )}
                                    {shareIndex === index && (
                                        <Portal>
                                            <PopupWindow label='Share' buttonLeft='Cancel' buttonRight='Share'
                                                confirm={(output) => editReceipt('SHARE', invoice.invoice.invoiceID, invoice.invoice.recipientID, output)} toggleVisibility={() => togglePopupShare()}
                                                textfeild={true} textfeildCaption='Enter target user email address' textfeildLabel='email@domain.com' textfeildType='email' />
                                        </Portal>
                                    )}
                                    <div className="invoice-menu">
                                        <div>
                                            {invoice.invoice.flagged && (
                                                <i className="info-icon" class="fa-solid fa-flag"></i>
                                            )}
                                            {invoice.invoice.sharedWith.length > 0 && (
                                                <i className="info-icon" class="fa-solid fa-users"></i>
                                            )}
                                        </div>
                                        <div>
                                            <i className="invoice-icon" class="fa-solid fa-share" onClick={() => { togglePopupShare(index); console.log(invoice.invoice.sharedWith) }}></i>
                                            <i className="invoice-icon" class="fa-solid fa-ellipsis-vertical" onClick={() => toggleDropdown(index)}></i>
                                        </div>
                                    </div>
                                    {dropdownIndex === index && (
                                        <div className="invoice-dropdown">
                                            <ul>
                                                <li onClick={() => editReceipt('FLAG', invoice.invoice.invoiceID, invoice.invoice.recipientID)}>
                                                    <i class="fa-solid fa-flag"></i>
                                                    <span>Flag</span>
                                                </li>
                                                <li>
                                                    <i class="fa-solid fa-trash" onClick={() => togglePopupDelete(index)}></i>
                                                    <span>Delete</span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    <div className="merchant-info">
                                        <div className="logo-container">
                                            <img src='./sampleimg.jpg' className="logo" />
                                        </div>
                                        <div className="merchant-labels-container">
                                            <p className="merchantID">Merchant: {invoice.invoice.merchantID}</p>
                                            <p className="merchant-individual-location">Location ID: {invoice.invoice.merchantLocNumber}</p>
                                            <p className="merchantAddress">Address: {invoice.invoice.merchantAddress}</p>
                                        </div>
                                    </div>
                                    <p className="item-tag">Items:</p>
                                    <Link to={`/invoices/${invoice.invoice.invoiceID}`} key={index} className='invoiceLink'>
                                        <div className="item-list-container">
                                            <ul>
                                                {
                                                    invoice.items.map((item, itemIndex) => {
                                                        return (
                                                            <div className={item.returned ? "item-container-returned" : "item-container"}>
                                                                <li key={itemIndex}>
                                                                    <p className="item-name">{item.name}: {item.price}</p>
                                                                </li>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </Link>
                                    <div className="invoice-info">
                                        <p className="date-purchased">
                                            {invoice.invoice.dateCreated}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        </div>
    );
}

export default MerchantConsole;
