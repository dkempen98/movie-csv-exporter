import { useState, useEffect, useRef } from 'react';
import { movieSearch, movieCredits } from '../api/tmdb_api.js';

export default function MovieSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            const jsonData = await movieSearch(searchQuery);
            setResults(jsonData.results || []);
        };

        const debounceFetch = setTimeout(fetchResults, 500);
        return () => clearTimeout(debounceFetch);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setIsResultsVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleMovieClick = async (movie) => {
        const creditData = await movieCredits(movie.id);
        const director = creditData.crew.find((member) => member.job === 'Director');
        const cast = creditData.cast.slice(0, 20);

        const movieDetails = {
            ...movie,
            credits: {
                director,
                cast,
            },
            isOpen: true,
            selectedPeople: [
                ...(director ? [{ ...director, job: 'Director' }] : []),
                ...(cast.length > 0 ? [cast[0]] : []),
            ],
        };

        setSelectedMovies((prev) => [movieDetails, ...prev]);
        setIsResultsVisible(false);
        setSearchQuery('');
    };

    const toggleAccordion = (index) => {
        setSelectedMovies((prev) =>
            prev.map((movie, i) =>
                i === index ? { ...movie, isOpen: !movie.isOpen } : movie
            )
        );
    };

    const handleCheckboxChange = (movieIndex, person) => {
        setSelectedMovies((prev) =>
            prev.map((movie, i) =>
                i === movieIndex
                    ? {
                        ...movie,
                        selectedPeople: movie.selectedPeople.some(
                            (p) => p.id === person.id
                        )
                            ? movie.selectedPeople.filter((p) => p.id !== person.id)
                            : [...movie.selectedPeople, person],
                    }
                    : movie
            )
        );
    };

    const removeMovie = (index) => {
        setSelectedMovies((prev) => prev.filter((_, i) => i !== index));
    };

    const exportToCSV = () => {
        const movieData = selectedMovies.map((movie) => ({
            Name: movie.title,
            Poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }));

        const peopleData = selectedMovies.flatMap((movie) =>
            movie.selectedPeople.map((person) => ({
                Name: person.name,
                Role: person.job || 'Actor',
                Movie: movie.title,
            }))
        );

        const generateCSV = (data, filename) => {
            const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                    Object.keys(data[0]).join(','), // Header row
                    ...data.map((row) =>
                        Object.values(row)
                            .map((val) => `"${val}"`)
                            .join(',')
                    ),
                ].join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        if (movieData.length > 0) generateCSV(movieData, 'movies.csv');
        if (peopleData.length > 0) generateCSV(peopleData, 'cast_and_crew.csv');
    };

    return (
        <div className="movie-search-container" ref={searchContainerRef}>
            <input
                type="text"
                placeholder="Search for a movie"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsResultsVisible(true);
                }}
                className="movie-search-input"
            />
            {isResultsVisible && results.length > 0 && (
                <ul className="movie-search-results">
                    {results.map((movie) => (
                        <li
                            key={movie.id}
                            onClick={() => handleMovieClick(movie)}
                            className="movie-search-result-item"
                        >
                            {movie.title} ({(movie.release_date).substring(0,4)})
                        </li>
                    ))}
                </ul>
            )}

            <div className="selected-movies">
                {selectedMovies.map((movie, index) => (
                    <div
                        key={movie.id}
                        className={`accordion-item ${
                            movie.isOpen ? 'open' : ''
                        }`}
                    >
                        <div className="accordion-label" onClick={() => toggleAccordion(index)}>
                            <span>
                                {movie.title}
                            </span>
                            <button
                                className="remove-button"
                                onClick={() => removeMovie(index)}
                            >
                                Remove
                            </button>
                        </div>
                        {movie.isOpen && (
                            <div className="accordion-content">
                                <p><strong>Include in Export:</strong></p>
                                <ul>
                                    {movie.credits.director && (
                                        <li>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={movie.selectedPeople.some(
                                                        (p) => p.id === movie.credits.director.id
                                                    )}
                                                    onChange={() =>
                                                        handleCheckboxChange(index, {
                                                            ...movie.credits.director,
                                                            job: 'Director',
                                                        })
                                                    }
                                                />
                                                {movie.credits.director.name} (Director)
                                            </label>
                                        </li>
                                    )}
                                    {movie.credits.cast.map((castMember) => (
                                        <li key={castMember.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={movie.selectedPeople.some((p) => p.id === castMember.id)}
                                                    onChange={() => handleCheckboxChange(index, castMember)}
                                                />
                                                {castMember.name} (Actor)
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedMovies.length > 0 && (
                <button className="export-button" onClick={exportToCSV}>
                    Export to CSV
                </button>
            )}
        </div>
    );
}
