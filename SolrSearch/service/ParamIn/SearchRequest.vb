Imports System.Runtime.Serialization

<DataContract()>
Public Class SearchRequest
    <DataMember()>
    Public Property Handler As String
    <DataMember()>
    Public Property Request As String
End Class
