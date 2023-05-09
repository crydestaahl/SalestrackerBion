
useEffect(() => {
    // Kolla om data finns i local storage
    const cachedData = localStorage.getItem('cachedData');
    if (cachedData) {
      setData(JSON.parse(cachedData));
      console.log(JSON.parse(cachedData));/*  */
    } else {
      // Hämta data från API      
      fetch(
        `https://manager.tickster.com/Statistics/SalesTracker/Api.ashx?keys=${apiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setData(data);
          // Spara data i local storage -
          localStorage.setItem('cachedData', JSON.stringify(data));
        })

        .catch((error) => console.error(error));
    }
  }, []);