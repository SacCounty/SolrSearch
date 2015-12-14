Imports System.IO
Imports System.ServiceModel
Imports System.ServiceModel.Web

<ServiceContract()>
Public Interface ISolrSearchRest
    <OperationContract()>
    <WebGet(UriTemplate:="search/{handler}?q={q}&sort={sort}&start={start}&group={group}&fq={fq}", RequestFormat:=WebMessageFormat.Json, BodyStyle:=WebMessageBodyStyle.Bare)>
    Function Search(handler As String, q As String, sort As String, start As String, group As String, fq As String) As Stream
End Interface
