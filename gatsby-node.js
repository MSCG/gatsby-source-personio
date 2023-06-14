const axios = require('axios').default
const parseXmlString = require('xml2js').parseString

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// You can delete this file if you're not using it

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */
//exports.onPreInit = () => console.log("Loaded gatsby-source-personio")

const POST_NODE_TYPE = `PersonioPosition`

exports.sourceNodes = async ({
    actions,
    createContentDigest,
    reporter
}, pluginOptions) => {
    const { createNode } = actions

    const fetchActivity = reporter.activityTimer(`Personio: Fetch data`)
    fetchActivity.start()

    // Fetch data from personio and parse the xml.
    const rawXml = await axios.get(`https://${pluginOptions.domainName}.jobs.personio.de/xml?language=${pluginOptions.language}`)
    let data
    parseXmlString(rawXml.data, (error, result) => {
        data = result
    })
    const positions = data['workzag-jobs'].position
    
    fetchActivity.end()
    
    const processingActivity = reporter.activityTimer(`Personio: Process data`)
    processingActivity.start()

    console.info(`Creating ${positions.length} Personio Position nodes`)

    // loop through data and create Gatsby nodes.
    positions.forEach(position => {
        // skip the position if it doesn't have a description in the specified language.
        if (!position.jobDescriptions[0].jobDescription) return

        let parsedPosition = {}

        Object.keys(position).forEach(key => {
            if (key === 'jobDescriptions') {
                parsedPosition['jobDescriptions'] = position.jobDescriptions[0].jobDescription.map((item) => {
                    return {
                        name: item.name[0],
                        value: pluginOptions.removeStyling ? item.value[0].replace(/ style=\"[^\"]*\"/g, "") : item.value[0]
                    }
                })
            } else {
                parsedPosition[key] = position[key][0]
            }
        })

        createNode({
            ...parsedPosition,
            node_locale: pluginOptions.language,
            parent: null,
            children: [],
            internal: {
                type: POST_NODE_TYPE,
                content: JSON.stringify(parsedPosition),
                contentDigest: createContentDigest(parsedPosition),
            },
        })
    })
    
    processingActivity.end()
    return
}