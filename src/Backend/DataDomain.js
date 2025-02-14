import { Auth } from "aws-amplify";

const axios = require("axios").default;
const cfnOutput = require("../cfn-output.json")

const DataDomain = {
    async isOwner(accountId) {
        const apiUrl = `${cfnOutput.InfraStack.WorkflowApiUrl}/data-domain/validate-owner?accountId=${accountId}`
        const session = await Auth.currentSession()

        try {
            await axios({
                method: "GET",
                url: apiUrl,
                headers: {
                    "Authorization": session.getAccessToken().getJwtToken()
                }
            })

            return true
        } catch (e) {
            return false
        }
    },
    async refresh() {
        const currentSession = await Auth.currentSession();
        const refreshLfTagUrl = cfnOutput.InfraStack.WorkflowApiUrl + "/tags/sync-permissions";
        const refreshDataDomainPermissionsUrl = cfnOutput.InfraStack.WorkflowApiUrl + "/data-domains/sync-permissions";

        await Promise.all([
            axios({
                method: "POST",
                url: refreshLfTagUrl,
                headers: {
                    "Authorization": currentSession.getAccessToken().getJwtToken()
                }
            }),
            axios({
                method: "POST",
                url: refreshDataDomainPermissionsUrl,
                headers: {
                    "Authorization": currentSession.getAccessToken().getJwtToken()
                }
            })
        ])
    },
    async register(domainId, domainSecretArn, domainTags) {
        const registerUrl = `${cfnOutput.InfraStack.WorkflowApiUrl}/data-domain/register`
        const session = await Auth.currentSession()
        await axios({
            method: "POST",
            url: registerUrl,
            headers: {
                "Authorization": session.getAccessToken().getJwtToken(),
                "Content-Type": "application/json"
            },
            data: {
                "domainId": domainId,
                "domainSecretArn": domainSecretArn,
                "customLfTags": domainTags.map((tag) => ({TagKey: tag.TagKey, TagValues: [tag.TagValues]}))
            }
        })
    },
    async getOwnedDomainIds() {
        const session = await Auth.currentSession()
        const apiUrl = `${cfnOutput.InfraStack.WorkflowApiUrl}/data-domain/list`

        const {data} = await axios({
            method: "GET",
            url: apiUrl,
            headers: {
                "Authorization": session.getAccessToken().getJwtToken(),
                "Content-Type": "application/json"
            }
        })

        return data
    },
    async getListOfShared(domainId, product) {
        const session = await Auth.currentSession()
        const apiUrl = `${cfnOutput.InfraStack.WorkflowApiUrl}/data-products/list-of-shared?domainId=${domainId}&product=${product}`

        const {data} = await axios({
            method: "GET",
            url: apiUrl,
            headers: {
                "Authorization": session.getAccessToken().getJwtToken(),
                "Content-Type": "application/json"
            }
        })

        return data
    },
    async getListOfConsumers(domainId, product) {
        const session = await Auth.currentSession()
        const apiUrl = `${cfnOutput.InfraStack.WorkflowApiUrl}/data-products/list-of-consumers?domainId=${domainId}&product=${product}`

        const {data} = await axios({
            method: "GET",
            url: apiUrl,
            headers: {
                "Authorization": session.getAccessToken().getJwtToken(),
                "Content-Type": "application/json"
            }
        })

        return data
    }
}

export default DataDomain