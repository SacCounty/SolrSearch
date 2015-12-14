Imports System.Runtime.Serialization

<DataContract()>
Public Class AutoCompleteResponse
    Inherits OutBase

    <DataMember()>
    Public Property Result As String
End Class
