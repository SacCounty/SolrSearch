Imports System.Runtime.Serialization

<DataContract()>
Public Class SearchResponse
    Inherits OutBase

    <DataMember()>
    Public Property Result As String

End Class
