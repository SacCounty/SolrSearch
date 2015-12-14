Imports System.ServiceModel

<ServiceContract()>
Public Interface ISolrSearchAjax
    <OperationContract()>
    Function AutoComplete(request As AutoCompleteRequest) As AutoCompleteResponse

    <OperationContract()>
    Function Search(request As SearchRequest) As SearchResponse
End Interface
