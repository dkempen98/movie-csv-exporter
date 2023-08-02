import theMovieDb, { movies } from 'themoviedb-javascript-library'
import { useEffect, useRef, useState } from 'react'
import reelLogo from '../images/film-reel-vector.png'

export default function Grid() {

    // TODO:: Make items dynamic
    const refOne = useRef(null)

    const [xGrid, setXGrid] = useState(['Steven Spielberg', 'John Williams', 'Tom Cruise'])
    const [yGrid, setYGrid] = useState(['Tom Hanks', 'Jamie Foxx', 'Kathleen Kennedy'])
    const [gridItems, setGridItems] = useState([])
    const [xGridIds, setXGridIds] = useState([488, 491, 500])
    const [yGridIds, setYGridIds] = useState([31, 134, 489])

    const [xVal, setXVal] = useState(null)
    const [yVal, setYVal] = useState(null)
    const [remainingGuesses, setRemainingGuesses] = useState(9)
    const [guesses, setGuesses] = useState([])
    const [answers, setAnswers] = useState([])
    
    const [modal, setModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [resultList, setResultList] = useState()
    const [resultEl, setResultEl] = useState()
    
    let imageUrl = ''
    let movieName = ''

    function init() {
        defineGrid();
    }

    function defineGrid() {
        let gridPH = []

        gridPH = xGrid.map((header, index) => 
            <div key={"x-header-"+index} className='x-header'>{ header }</div>
        )

        gridPH.push(
            <div key={'empty-0'} className='empty-item' aria-hidden='true'></div>
        )

        for(let i = 0; 9 > i; i++) {
            let rowNum = i/3
            if((i % 3) === 0) {
                gridPH.push(
                    <div key={"y-header-"+rowNum} className='y-header'>{ yGrid[rowNum] }</div>
                )
            }
            gridPH.push(
                <button key={'grid-square-'+i} id={'square-'+i} className={'grid-square square-'+i} onClick={() => initSearch(i)}><span id={'square-label-'+i}></span></button>
            )
            if(i === 2 || i === 5 || i === 8) {
                gridPH.push(
                    <div key={'empty-'+i} className='empty-item' aria-hidden='true'></div>
                )
            }
        }
        
        gridPH.unshift(
            <div key={'grid-logo'} className='logo-container'><img className='logo' src={reelLogo}/></div>
        )

        setGridItems(gridPH)

    }

    function initSearch(boxNum) {
        if(remainingGuesses <= 8) {
            return
        } else {
            setXVal(boxNum % 3)
            setYVal((boxNum - (boxNum % 3)) / 3)
            setModal(oldVal => !oldVal);
        }
    }

    function searchCall() {
    if((searchQuery.length < 0 || !searchQuery) && document.getElementById('search-bar-input')) {
        setResultList()
        setResultEl()
        document.getElementById('search-bar-input').style.borderRadius = '30px';
        return
    }

    theMovieDb.common.api_key = process.env.REACT_APP_API_KEY

    let searchString = searchQuery.replaceAll(' ', '%')
    console.log(searchString)

    theMovieDb.search.getMovie({"query":searchString}, successCB, errorCB)
    }

    function successCB(data) {
        let jsonData = JSON.parse(data)
        console.log(jsonData);

        let resultArray = jsonData.results
        let movieList = []

        console.log(resultArray)

        resultArray.map(movie => {
            let resultString = movie.title
            if(movie.release_date) {
                let year = movie.release_date.substring(0, 4)
                resultString += ' (' + year + ')'
            }

            movieList.push(<li key={movie.id} className="search-results-items" onClick={() => movieSelected(movie)}>{resultString}</li>)
        });

        console.log(movieList)

        setResultList(movieList)
    };
            
    function errorCB(data) {
        console.log("Error callback: " + data);
    };

    function addMovieList() {
        if((searchQuery.length < 0 || !searchQuery) && document.getElementById('search-bar-input')) {
            setResultList()
            setResultEl()
            document.getElementById('search-bar-input').style.borderRadius = '30px';
            return
        }

        if(resultList) {
            setResultEl(
                <ul className="search-results" >
                    {resultList}
                </ul>
            )
        } else {
            setResultEl()
        }

        let searchBar = document.getElementById('search-bar-input')
        if(searchBar) {
            searchBar.style.borderBottomLeftRadius = '0px';
            searchBar.style.borderBottomRightRadius = '0px';
        }        
        return

    }

    function movieSelected(movieInfo) {
        console.log(movieInfo)

        imageUrl = 'https://image.tmdb.org/t/p/w200' + movieInfo.poster_path
        movieName = movieInfo.title

        theMovieDb.movies.getCredits({"id": movieInfo.id}, analyzeGuess, errorCB)

        // setModal(false)
    }

    function analyzeGuess(data) {
        let castAndCrew = JSON.parse(data)
        let xMatch = false
        let yMatch = false
        let boxId = 'square-' + ((yVal * 3) + xVal)
        let boxEl = document.getElementById(boxId) 
        let boxLabel = 'square-label-' + ((yVal * 3) + xVal)
        let boxLabelEl = document.getElementById(boxLabel) 

        setRemainingGuesses(guesses => guesses - 1)

        if (castAndCrew.cast.some(member => member.id === xGridIds[xVal])) {
            xMatch = true
        } else if (castAndCrew.crew.some(member => member.id === xGridIds[xVal])) {
            xMatch = true
        } else {
            console.log('Failure')
            boxEl.classList.add('missed-guess')
            setModal(false)
            setResultEl()
            return
        }

        if (castAndCrew.cast.some(member => member.id === yGridIds[yVal])) {
            yMatch = true
        } else if (castAndCrew.crew.some(member => member.id === yGridIds[yVal])) {
            yMatch = true
        } else {
            console.log('Failure')
            boxEl.classList.add('missed-guess')
            setModal(false)
            setResultEl()
            return
        }

        if(xMatch && yMatch) {
            console.log('success')
            boxEl.style.backgroundColor = 'green'
            console.log(imageUrl)
            boxEl.style.backgroundImage = `url(${imageUrl})`
            boxEl.disabled = true;

            boxLabelEl.innerHTML = movieName
            boxLabelEl.classList.add('correct-label')
        }

        setModal(false)
        setResultEl()


    }

    function gameOver() {
        console.log('Happening')
        console.log(remainingGuesses <= 0)
        if(remainingGuesses <= 0) {
            document.getElementsByClassName('grid-square').disabled = true;
        }
    }

    function handleClickOutside(e) {
        if(e.target && refOne.current) {
            if(!refOne.current.contains(e.target)) {
                setSearchQuery('')
                setModal(false)
                setResultEl()
                setResultList()
                document.getElementById('search-bar-container').style.borderRadius = '30px';
                document.getElementById('search-bar-container').value = '';
            }
        }
    }

    useEffect(() => {
        init();
        document.addEventListener("click", handleClickOutside, true)

        return () => {
            document.removeEventListener("click", handleClickOutside, true)
        }
    }, [])

    useEffect(() => {
        if(modal) {
            document.getElementById('search-bar-input').focus()
        }
    }, [modal])

    useEffect(() => {
        const delayCall = setTimeout(() => {
          searchCall()
        }, 600)
    
        return () => clearTimeout(delayCall)
      }, [searchQuery])

    useEffect(() => {
        addMovieList()
    }, [resultList])

    useEffect(() => {
        gameOver()
    }, [remainingGuesses])

    return (
        <div>
            <div className='grid-container'>
                {gridItems}
            </div>
            <div className='guess-counter'>
                <div>Remaining Guesses:</div>
                <div>{ remainingGuesses }</div>
            </div>
            {modal && (
                <div className='overlay'>
                    <div className='search-bar-container' id='search-bar-container' ref={refOne}>
                        <div className="search-bar" id="search-bar">
                            <input autoComplete="off" type="text" className="search-bar-input" placeholder="Search for a Movie" aria-label="Player Search" id="search-bar-input" onChange={e => setSearchQuery(e.target.value)}/>
                        </div>
                        {resultEl}
                    </div>
                </div>
            )}
        </div>
    )
    

}