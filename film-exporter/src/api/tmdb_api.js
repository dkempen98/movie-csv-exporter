

const getOptions = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.REACT_APP_API_KEY
    }
};

export async function movieSearch(searchString) {
    const encodedSearch = encodeURIComponent(searchString.trim());

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_API_KEY}&query=${searchString}`;

    try {
        const response = await fetch(url, getOptions);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}


export async function movieCredits(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits`;

    try {
        const response = await fetch(url, getOptions);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}