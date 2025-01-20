import { useEffect, useRef, useState } from "react"

export default function HelpBar() {
    
    const refOne = useRef(null)
    const [helpModal, setHelpModal] = useState(false)

    function handleClickOutside(e) {
        if(e.target && refOne.current) {
            if(!refOne.current.contains(e.target)) {
                setHelpModal(false)
            }
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClickOutside, true)

        return () => {
            document.removeEventListener("click", handleClickOutside, true)
        }
    }, [])

    
    return (
        <div className="help-bar">
            <h1 className="title">Movie Exporter</h1>
            <div className='help-button' onClick={() => setHelpModal(true)}>?</div>
            {helpModal && (
                <div className='overlay'>
                    <div ref={refOne} className="help-modal">
                        <div className="help-button" onClick={() => setHelpModal(false)}>&#10006;</div>
                        <h2>How to Use</h2>
                        <p>Select a movie and it will be added to the list.</p>
                        <p>Each movie will be included in a movie export csv file.</p>
                        <p>The director and actors selected will be included in a second export.</p>
                        <h2>About</h2>
                        <p>The Movie Exporter was created by an independent developer using the <a href="https://developer.themoviedb.org/docs">TMDB API</a></p>
                    </div>
                </div>
            )}
        </div>

    )


}