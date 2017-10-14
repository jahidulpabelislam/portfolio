<?php
/**
 * Connects to a database and set up to send and receive data
 * using application constants defined in connection.php file
 * a reusable file for other projects
 * MySQL specific
 * @author Jahidul Pabel Islam
 */

class pdodb
{
    private $db;
    private $debug = true;

    /**
     * Connects to a MySQL engine
     * using application constants IP, USERNAME, and PASSWORD
     * defined in connection.php.
     *
     * If the database with name of constant DATABASENAME doesn't exist,
     * it is created using using the constant DATABASENAME and table/s are created using
     * constant CREATEQUERY
     */
    public function __construct()
    {
        $dsn = "mysql:host=" . IP . ";dbname=" . DATABASENAME . ";charset-UTF-8";
        $option = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
        try {
            $this->db = new PDO($dsn, USERNAME, PASSWORD, $option);
        } catch (PDOException $failure) {
            if ($this->debug)
                echo $failure;
        }
    }

    /**
     * Executes a sql query
     * @param $query string the sql query to run
     * @param null $bindings array array of any bindings to do with sql query
     * @return array array of data
     */
    public function query($query, $bindings = null)
    {
        if ($this->db) {
            try {
                //check if any bindings to execute
                if (isset($bindings)) {
                    $result = $this->db->prepare($query);
                    $result->execute($bindings);
                } else {
                    $result = $this->db->query($query);
                }

                //if query was a select, return array of data
                if (strpos($query, "SELECT") !== false) {
                    $results["rows"] = $result->fetchAll(PDO::FETCH_ASSOC);
                }
                $results["count"] = $result->rowCount();
            } catch (PDOException $failure) {
                if ($this->debug)
                    $results["meta"]["error"] = $failure;

                $results["meta"]["ok"] = false;
                $results["meta"]["feedback"] = "Problem with Server.";
            }
        }
        else
        {
            $results["meta"]["ok"] = false;
            $results["meta"]["feedback"] = "Problem with Server.";
        }
        return $results;
    }

    /**
     * @return int id of last inserted row of data
     */
    public function lastInsertId()
    {
        return $this->db->lastInsertId();
    }
}