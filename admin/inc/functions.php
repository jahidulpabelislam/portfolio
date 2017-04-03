<?php
/*
 * All the functions for API
 * @author Jahidul Pabel Islam
*/

//contains the different functions for the API

//get the method
$method = $_SERVER['REQUEST_METHOD'];

//get the path to decide what happens
$path = explode('/', ltrim($_SERVER['PATH_INFO'], "/"));

$data = array();
foreach ($_REQUEST as $key => $value) {
    $data[$key] = stripslashes(urldecode($_REQUEST[$key]));
}

/**
 * Check if all data needed is provided
 * And data provided is not empty
 * @param $data array array of data provided
 * @param $dataNeeded array array of data needed
 * @return bool whether data provided is valid and data needed is provided
 */
function checkData($data, $dataNeeded)
{

    //loops through each request needed
    foreach ($dataNeeded as $aData) {

        //checks if data needed is provided and is not empty
        if (!isset($data[$aData]) || trim($data[$aData]) === "") {
            //return false as data needed is not provided or empty
            return false;
        }

    }

    //otherwise data provided are ok and data needed are provided
    return true;
}

/**
 * When the method provided is not allowed
 * @param $method string the method tried
 * @param $path string the path tried
 * @return array array of meta data
 */
function methodNotAllowed($method, $path)
{
    $meta["ok"] = false;
    $meta["status"] = 405;
    $meta["message"] = "Method not allowed.";
    $meta["feedback"] = "${method} Method Not Allowed on ${path}.";
    return $meta;
}

/**
 * Send necessary meta data back when needed data is not provided
 * @param $dataNeeded array array of data needed
 * @return array array of meta data
 */
function dataNotProvided($dataNeeded)
{
    $meta["ok"] = false;
    $meta["status"] = 400;
    $meta["message"] = "Bad Request";
    $meta["requestsNeeded"] = $dataNeeded;
    $meta["feedback"] = "The necessary data was not provided.";
    return $meta;
}

function sendData($results, $data, $method, $path)
{

    //send back the data provided
    $results['meta']["data"] = $data;
    //send back the method requested
    $results['meta']["method"] = $method;
    //send back the path they requested
    $results['meta']["path"] = $path;

    //check if requested to send json
    $json = (stripos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

    //check is everything was ok
    if (isset($results["meta"]["ok"]) && $results["meta"]["ok"] !== false) {
        $status = isset($results["meta"]["status"]) ? $results["meta"]["status"] : 200;
        $message = isset($results["meta"]["message"]) ? $results["meta"]["message"] : "OK";
    } else {
        $status = isset($results["meta"]["status"]) ? $results["meta"]["status"] : 500;
        $message = isset($results["meta"]["message"]) ? $results["meta"]["message"] : "Internal Server Error";
    }

    $results["meta"]["status"] = $status;
    $results["meta"]["message"] = $message;

    header("HTTP/1.1 $status $message");

    //send the results, send by json if json was requested
    if ($json) {
        header("Content-Type: application/json");
        echo json_encode($results);
    } //else send by plain text
    else {
        header("Content-Type: text/plain");
        echo("results: ");
        var_dump($results);
    }
}