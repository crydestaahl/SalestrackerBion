import React, { useEffect, useState } from 'react';
import './App.css';
import { Fade } from 'react-awesome-reveal';
import logo from './logo-white-landscape.png';

function App() {
  const [data, setData] = useState(null);
  const [expandedIndex] = useState(null);
  const [inputData, setInputData] = useState('92LYKT');
  const [loading, setLoading] = useState(false); // state variable for loading status
  const [apiKey, setApiKey] = useState('92LYKT');
  const [activeIndex, setActiveIndex] = useState(null); // state variable to store the active index
  const [notToggled, setNotToggled] = useState(false); // state variable

  const handleFocus = () => {
    setInputData('');
  };

  const handleInput = (e) => {
    const newInput = e.target.value.toUpperCase();
    setInputData(newInput.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveInput();
    }
  };

  const refresh = () => {
    window.location.reload();
  };

  const toggleInfoFunction = (index) => { // function to toggle the active index
    notToggled ? setNotToggled(false) : setNotToggled(true);
    console.log(notToggled);
    if (activeIndex === index) { // if the current index is already active, set it to null
      setActiveIndex(null);
    } else { // otherwise, set it to the current index
      setActiveIndex(index);
    }
  };

  function formatTime(timeStr) {
    const date = new Date(timeStr);
    const isoString = date.toISOString();
    const formattedDate = isoString.substring(0, 10);
    const formattedTime = isoString.substring(11, 16);
    return formattedDate + ' ' + formattedTime;
  }

  useEffect(() => {
    const fetchData = () => {
      localStorage.clear();
      setLoading(true);
      fetch(
        `https://proxyserversalestracker.onrender.com/https://manager.tickster.com/Statistics/SalesTracker/Api.ashx?keys=${apiKey.trim()}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setData(data);
          // Spara data i local storage -
          localStorage.setItem('cachedData', JSON.stringify(data));
          setLoading(false);
        }) 
        .catch((error) => console.error(error));
    };
    fetchData();
  }, [apiKey]);

  const saveInput = () => {
    setData('');

    if (inputData.length === 6) {
      localStorage.clear();
      setLoading(true);

      fetch(
        `https://proxyserversalestracker.onrender.com/https://manager.tickster.com/Statistics/SalesTracker/Api.ashx?keys=${apiKey.trim()}`
      )
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          // Spara data i local storage -
            localStorage.setItem('cachedData', JSON.stringify(data));
            setApiKey(inputData);
            setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      alert('Felaktig nyckel, försök igen.');
      window.location.reload();
    }
  };

  if (!data) {
    return (
      <div className='keyInput'>
        <img src={logo} alt='Krall' className='logo' />
        {loading ? (
          <div>
            <p className='loading'>Laddar data</p>
            <p className='loadingText'>
              Detta kan ta lite tid om det är första gången du hämtar data på
              denna nyckeln.
            </p>
          </div>
        ) : (
          <p></p>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className='keyInput'>
        <img src={logo} alt='Krall' className='logo' />
        <h3>Salestrackernyckel:</h3>
        <input
          type='text'
          value={inputData}
          onChange={handleInput}
          placeholder='T ex 12345'
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />
        <button onClick={saveInput}>Hämta</button>
        {!loading ? '' : ''}
      </div>
    );
  }
  
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} alt='Krall' className='logo' />
        <div className='eventFeed'>
          {loading ? <p className='loading'>Laddar data</p> : <p></p>}
          {!loading  ? (
            data.map((item, index) => (
              <Fade>
                <div
                  className={`eventCard ${
                    index === expandedIndex ? 'transition' : ''
                  }`}
                  key={item.erc}
                  loading='lazy'
                >
                  <div className='eventInfo' key={item.erc}>  
                    <h3 className='eventName'>{item.name}</h3>
                    <h4>Salong: {(item.ven.name)}</h4>
                    <h4>Start: {formatTime(item.startLocal)}</h4>
                    <h3 className='totalSales'>Total försäljning: {' '} 
                      {item.sales.salesAmtNet + item.gfs
                        .filter(ticket => ticket.type === 0 || ticket.type === 5)
                        .reduce((sum, ticket) => sum + ticket.pIncVatHi * ticket.soldQtyNet, 0)} kr
                      </h3>
                      <h4>{item.sales.soldQtyNet + ' av ' + item.sales.totCapacity + ' biljetter sålda.'} </h4>
                    <button onClick={() => toggleInfoFunction(item.erc)}>{notToggled ? 'Mindre info' : 'Mer info'}</button>

                    <div 
                    className="ticketInfo"
                    style={{
                      display: activeIndex === item.erc ? 'block':'none'
                    }}>
                    <h3>Biljetter: {item.gfs
                      .filter(ticket => ticket.type === 1 )              
                      .reduce((sum, ticket) => sum + ticket.soldQtyNet, 0)} st</h3>

                    {item.gfs
                      .filter(ticket => ticket.name === 'Rullstolsplats' || ticket.name === "Ordinarie parkett" || ticket.name === "Ordinarie balkong"  )              
                      .map(ticket => ( // map over the filtered tickets
                       <div className='ticketInfo'>
                        <p><b>{ ticket.name + ': '}</b></p>
                        <p>Sålt antal:  <b>{ticket.soldQtyNet} </b></p>
                       </div>                        
                      ))
                    }
                    <h4 className=''>Summa biljetter: {item.gfs
                      .filter(ticket => ticket.type === 1)
                      .reduce((sum, ticket) => sum + ticket.pIncVatHi * ticket.soldQtyNet, 0)} kr
                    </h4>

                    <h3 className='mgTop'>Paket:  {item.gfs
                      .filter(ticket  => ticket.type === 7 )              
                      .reduce((sum, ticket) => sum + ticket.soldQtyNet, 0)} st</h3>
                    {item.gfs
                      .filter(ticket => 
                        ticket.name === 'Show inkl. veg. balkonglåda' || 
                        ticket.name === 'Show inkl. balkonglåda' || 
                        ticket.name === "Show inkl. 2-rätters i bistron" || 
                        ticket.name === "Rullstol inkl. 2-rättersmeny" || 
                        ticket.name === "2-rättersmeny i bistron"  
                        )              
                      .map(ticket => ( // map over the filtered tickets
                       <div className='ticketInfo'>
                        <p><b>{ticket.name + ': '}</b></p>
                        <p>Sålt antal:  <b>{ticket.soldQtyNet} </b></p>
                       </div>                        
                      ))
                    }

                    <h3 className='mgTop'>Varor: {item.gfs
                      .filter(ticket => ticket.type === 0 || ticket.type === 5)              
                      .reduce((sum, ticket) => sum + ticket.soldQtyNet, 0)} st</h3>
                    {item.gfs
                      .filter(ticket => 
                        ticket.soldQtyNet >= 1 && (
                          ticket.name === 'Vegetarisk balkonglåda' ||
                          ticket.name === 'Balkonglåda' ||  
                          ticket.name === '2-rättersmeny i bistron'
                        )  
                      )  
                      .map(ticket => ( // map over the filtered tickets
                       <div className='ticketInfo'>
                        <p><b>{ticket.name + ': '}</b></p>
                        <p>Sålt antal:  <b>{ticket.soldQtyNet} </b></p>
                       </div>                        
                      ))
                    }
                    
                    <h4 className=''>Summa varor: {item.gfs
                      .filter(ticket => ticket.type === 0 || ticket.type === 5)
                      .reduce((sum, ticket) => sum + ticket.pIncVatHi * ticket.soldQtyNet, 0)} kr
                    </h4>

                    </div>
                    <img src={item.img.thumb} alt={item.name} />
                    <div className='scannedTickets'></div>
                  </div>
                </div>
              </Fade>
            ))
          ) : (
            <p className='error'>Nyckeln tillhör inte Folkets hus och parker</p>
          )}
          </div>
          
          <div className='keyInput'>
            <button className='refresh' onClick={refresh}>
              Ladda om sidan
            </button>
          <p className='currentKey'>Ladda data från en annan nyckel:</p>
          <input
            type='text'
            value={inputData}
            onChange={handleInput}
            placeholder='T ex 12345'
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
          />
          <button onClick={saveInput}>Hämta</button>
        </div>
      </header>
    </div>
  );
}

export default App;
