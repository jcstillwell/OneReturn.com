const MerchantRegister = () => {

    let navigate = useNavigate();

    const [formInfo, setFormInfo] = useState({
        businessName:'',
        businessAddress:'',
        businessType:'',
    });

    const handleInput = (event) => {
        const {name, value} = event.target;
        setFormInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (

        <div className="merchant-reg-container">
            <form className='merchant-reg-form'>
                <p>Please fill out the required feilds below.</p>
                <label htmlFor="businessName">Business Name</label>
                <input value={formInfo.businessName} onChange={handleInput} id="businessName" type="text" placeholder="Example LLC" />
                <label htmlFor="businessAddress">Business Address</label>
                <input value={formInfo.businessAddress} onChange={handleInput} id="businessAddress" type="text" placeholder="1234 Filler Cir, Exampleville, 12345" />
                <label htmlFor="email">Business Type</label>
                <input value={formInfo.businessType} onChange={handleInput} id="businessType" type="text" placeholder="LLC, Corporation, Sole Proprietorship" />
            </form>
            <button className='link-btn' onClick={() => navigate("/signin")}>Already have an account? Log in here.</button>
        </div>

    );

}