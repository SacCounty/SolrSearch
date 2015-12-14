Imports System.Runtime.Serialization

<DataContract()>
Public Class OutBase
    <DataMember()>
    Public Property Success As Boolean
    <DataMember()>
    Public Property [Error] As String
End Class
