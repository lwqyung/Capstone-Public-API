import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = new express();
const port = 3000;
app.use( express.static( "public" ) );
app.use(bodyParser.urlencoded({ extended: true }));

// Replace <API_KEY> with actual API key
const API_URL = "https://v6.exchangerate-api.com/v6/<API_KEY>/";

// get currency codes
let currencyCodes = [];
let initError = "";

// Initializing currency codes supported by exchange rate provider
try {
        const result = await axios.get( API_URL + "codes" );
        if ( result.data.result === "success" )
        {
            // Codes are expected in ["<CODE>", "<CURRENCY NAME>" ] format, sorted by currency code
            currencyCodes = result.data.supported_codes;
            // Sorting by currency name instead of currency code
            currencyCodes.sort( ( a, b ) => {
                if ( a[1] < b[1] )
                {
                    return -1;
                }
                else if ( a[1] > b[1] ) 
                {
                    return 1;
                }
                
                return 0;
            } );
        }
} catch (error) {
    initError = "Error occurred while contacting currency exchange rate provider. Please try again later.";
    // API will return failures with 404 result code, so handle them here
    if ( error.response.status === 404 )
    {
        console.error( error.response.data );
    }
    else
    {
        console.error( error.message );
    }   
}

let lastQueryParams = {};

app.get( "/", ( req, res ) => {
    if ( initError !== "" )
    {
        res.locals.error = initError;
    }
    else
    {
        res.locals.currencyCodes = currencyCodes;
    }
    res.render( "index.ejs" );
});

app.get( "/convert", async ( req, res ) => {
    if( req.query !== lastQueryParams )
    {
        try {
            const result = await axios.get( API_URL + "pair/" + req.query.fromCurrency + "/" + req.query.toCurrency + "/" + req.query.conversionAmount );
            if ( result.data.result === "success" )
            {
                res.locals.success = true;
                res.locals.fromAmount = req.query.conversionAmount;
                res.locals.fromCur = req.query.fromCurrency;
                res.locals.toAmount = result.data.conversion_result;
                res.locals.toCur = req.query.toCurrency;
                res.locals.exchangeRate = result.data.conversion_rate;
                res.locals.lastUpdate = result.data.time_last_update_utc;
                lastQueryParams = req.query;
                res.locals.currencyCodes = currencyCodes;
            }
       } catch (error) {
            res.locals.error = "Error occurred while contacting currency exchange rate provider. Please try again later."

            // API will return conversion failures with 404 result code, so handle them here
            if ( error.response.status === 404 )
            {
                console.error( error.response.data );
                // Handle only error that isn't related to our account or API key with the currency provider
                if ( error.response.data["error-type"] === "unsupported-code" )
                {
                    res.locals.error = "The currency exchange rate provider failed to recognize one of the currencies requested. Please report this issue to technical support of this website.";
                }
            }
            else
            {
                console.error( error.message );
            }
        }
    }

    res.render( "index.ejs" );
});

app.listen( port, () => {
    console.log( `listening on port ${port}` );
} );