import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import '../app/css/console.css';

const BACKEND = process.env.REACT_APP_BACKEND;

const Searchbar = ({onSearch}) => {

    const [query, setQuery] = useState('');

    const handleChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        const token = Cookies.get('token');
        axios.get(BACKEND+'/search/', {
            params: {
                query: newQuery
            },
            headers: {
                'Authorization': "Token " + token
            }
        })
        .then((response) => {
            console.log(response);
            onSearch(response.data.invoices);
        })
        .catch((error) => {
            console.error('error: ', error);
        });
    }

    return (
        <div className="search-field-container">
            <input className="search-field" label="Search..." onChange={handleChange} placeholder='Search...'/>
            <i className="filter" class="fa-solid fa-sliders"></i>
        </div>
    )

}

export default Searchbar;
