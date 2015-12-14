
Imports System.Collections.Generic
Imports System.ServiceModel
Imports System.ServiceModel.Channels
Imports System.ServiceModel.Configuration
Imports System.ServiceModel.Description
Imports System.ServiceModel.Dispatcher

Public Class CORSEnablingBehavior
    Inherits BehaviorExtensionElement
    Implements IEndpointBehavior
    Public Sub AddBindingParameters(endpoint As ServiceEndpoint, bindingParameters As BindingParameterCollection) Implements IEndpointBehavior.AddBindingParameters
    End Sub

    Public Sub ApplyClientBehavior(endpoint As ServiceEndpoint, clientRuntime As ClientRuntime) Implements IEndpointBehavior.ApplyClientBehavior
    End Sub

    Public Sub ApplyDispatchBehavior(endpoint As ServiceEndpoint, endpointDispatcher As EndpointDispatcher) Implements IEndpointBehavior.ApplyDispatchBehavior
        endpointDispatcher.DispatchRuntime.MessageInspectors.Add(New CORSHeaderInjectingMessageInspector())
    End Sub

    Public Sub Validate(endpoint As ServiceEndpoint) Implements IEndpointBehavior.Validate
    End Sub

    Public Overrides ReadOnly Property BehaviorType() As Type
        Get
            Return GetType(CORSEnablingBehavior)
        End Get
    End Property

    Protected Overrides Function CreateBehavior() As Object
        Return New CORSEnablingBehavior()
    End Function

    Private Class CORSHeaderInjectingMessageInspector
        Implements IDispatchMessageInspector
        Public Function AfterReceiveRequest(ByRef request As Message, channel As IClientChannel, instanceContext As InstanceContext) As Object Implements IDispatchMessageInspector.AfterReceiveRequest
            Return Nothing
        End Function

        Private Shared _headersToInject As IDictionary(Of String, String) = New Dictionary(Of String, String)() From {
            {"Access-Control-Allow-Origin", "*"},
            {"Access-Control-Request-Method", "POST,GET,PUT,DELETE,OPTIONS"},
            {"Access-Control-Allow-Headers", "X-Requested-With,Content-Type"}
        }

        Public Sub BeforeSendReply(ByRef reply As Message, correlationState As Object) Implements IDispatchMessageInspector.BeforeSendReply
            Dim httpHeader = TryCast(reply.Properties("httpResponse"), HttpResponseMessageProperty)
            For Each Item As KeyValuePair(Of String, String) In _headersToInject
                httpHeader.Headers.Add(Item.Key, Item.Value)
            Next
        End Sub
    End Class
End Class
