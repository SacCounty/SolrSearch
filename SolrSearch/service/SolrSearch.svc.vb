Imports System.ServiceModel
Imports System.ServiceModel.Activation
Imports System.ServiceModel.Web
Imports System.Net
Imports System.Runtime.Serialization.Json
Imports System.IO
Imports System.Net.Http
Imports System.Net.Http.Headers
Imports System.Web.Script.Serialization

<AspNetCompatibilityRequirements(RequirementsMode:=AspNetCompatibilityRequirementsMode.Allowed)>
Public Class SolrSearch
    Implements ISolrSearchAjax, ISolrSearchRest

    Public Function AutoComplete(request As AutoCompleteRequest) As AutoCompleteResponse Implements ISolrSearchAjax.AutoComplete
        Try
            Dim host As String = ConfigurationManager.AppSettings("host")
            Dim collection As String = ConfigurationManager.AppSettings("collection")
            Dim endpoint As String = "/spell"
            Dim url As String = String.Format("{0}/{1}/{2}?q={3}&wt=json", host, collection, endpoint, request.Term)
            Dim wrequest As WebRequest = WebRequest.Create(url)
            Dim ws As WebResponse = wrequest.GetResponse()

            Dim jsonSerializer As DataContractJsonSerializer = New DataContractJsonSerializer(GetType(List(Of String)))
            Dim Result As String = New StreamReader(ws.GetResponseStream()).ReadToEnd()

            Return New AutoCompleteResponse() With {.Success = True, .Result = Result}
        Catch ex As Exception
            Return New AutoCompleteResponse() With {.Success = False, .Error = ex.Message}
        End Try

    End Function

    Public Function Search(request As SearchRequest) As SearchResponse Implements ISolrSearchAjax.Search
        Try
            Dim host As String = ConfigurationManager.AppSettings("host")
            Dim pipeline As String = ConfigurationManager.AppSettings("pipeline")
            Dim collection As String = ConfigurationManager.AppSettings("collection")
            Dim url As String = String.Format("http://{0}:8764/api/apollo/query-pipelines/{1}/collections/{2}/{3}?{4}", host, pipeline, collection, request.Handler, request.Request)
            Dim username As String = ConfigurationManager.AppSettings("username")
            Dim password As String = ConfigurationManager.AppSettings("password")

            Dim clienthandler = New HttpClientHandler()

            Using client As New HttpClient(clienthandler)

                Dim byteArray = Encoding.ASCII.GetBytes(String.Format("{0}:{1}", username, password))
                client.DefaultRequestHeaders.Authorization = New AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray))
                client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json")

                Dim response = client.GetAsync(url).Result
                Dim result = response.Content.ReadAsStringAsync().Result

                Return New SearchResponse() With {.Success = True, .Result = result}
            End Using

        Catch ex As Exception
            Return New SearchResponse() With {.Success = False, .Error = ex.Message}
        End Try
    End Function

    Public Function Search(handler As String, q As String, sort As String, start As String, group As String, fq As String) As Stream Implements ISolrSearchRest.Search
        Try
            Dim host As String = ConfigurationManager.AppSettings("host")
            Dim pipeline As String = ConfigurationManager.AppSettings("pipeline")
            Dim collection As String = ConfigurationManager.AppSettings("collection")
            Dim qs As String = String.Empty

            If (Not String.IsNullOrWhiteSpace(q)) Then
                qs += "q=" & q & "&"
            End If
            If (Not String.IsNullOrWhiteSpace(sort)) Then
                qs += "sort=" & sort & "&"
            End If
            If (Not String.IsNullOrWhiteSpace(start)) Then
                qs += "start=" & start & "&"
            End If
            If (Not String.IsNullOrWhiteSpace(group)) Then
                qs += "group=" & group & "&"
            End If
            If (Not String.IsNullOrWhiteSpace(fq)) Then
                qs += "fq=" & fq & "&"
            End If

            qs = qs.TrimEnd("&")

            Dim url As String = String.Format("http://{0}:8764/api/apollo/query-pipelines/{1}/collections/{2}/{3}?{4}", host, pipeline, collection, handler, qs)
                Dim username As String = ConfigurationManager.AppSettings("username")
                Dim password As String = ConfigurationManager.AppSettings("password")

                Dim clienthandler = New HttpClientHandler()

                Using client As New HttpClient(clienthandler)

                    Dim byteArray = Encoding.ASCII.GetBytes(String.Format("{0}:{1}", username, password))
                    client.DefaultRequestHeaders.Authorization = New AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray))
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json")

                    Dim response = client.GetAsync(url).Result
                    Dim result = response.Content.ReadAsStreamAsync().Result

                    WebOperationContext.Current.OutgoingResponse.ContentType = "application/json"
                    Return result
                End Using

        Catch ex As Exception
            Throw
        End Try
    End Function
End Class
