<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9" version="1.0">
    <xsl:template match="/">
        <html>
            <head>
                <!--The Title Page-->
                <title>Site Map - Jahidul Pabel Islam</title>

                <!--CSS, Styling the page using CSS-->
                <style type="text/css">

                    body {
                        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
                    }

                    h1 {
                        text-align: center;
                    }

                    table {
                        padding: 0;
                        margin: auto;
                    }

                    th {
                        text-align: left;
                    }

                    a {
                        color: black;
                    }

                </style>
            </head>

            <body>
                <!--Heading for page-->
                <h1 text-align="center">Site Map</h1>
                <!--A Table to hold the links-->
                <table border="1">
                    <!--Table column name-->
                    <tr bgcolor="#337ab7">
                        <th>URL</th>
                    </tr>
                    <!--Loop through each page in set-->
                    <xsl:for-each select="sitemap:urlset/sitemap:url">
                        <!--Create a row-->
                        <tr>
                            <td>
                                <!--Create a 'a' tag-->
                                <a>
                                    <xsl:attribute name="href">
                                        <!--Make href of a tag the link of page-->
                                        <xsl:value-of select="sitemap:loc"/>
                                    </xsl:attribute>
                                    <!--Make link text the link of page-->
                                    <xsl:value-of select="sitemap:loc"/>
                                </a>
                            </td>
                        </tr>
                    </xsl:for-each>
                </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
