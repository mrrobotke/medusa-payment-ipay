import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Switch, Text, toast, Button } from "@medusajs/ui"
import { useState, useEffect } from "react"

type IPayConfig = {
  vid: string
  hashKey: string
  live: boolean
  enabledChannels: {
    mpesa: boolean
    airtel: boolean
    creditcard: boolean
    pesalink: boolean
  }
}

const IPayConfigWidget = () => {
  const [config, setConfig] = useState<IPayConfig>({
    vid: "",
    hashKey: "",
    live: false,
    enabledChannels: {
      mpesa: true,
      airtel: true,
      creditcard: false,
      pesalink: false
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from your backend
      // For now, we'll load from localStorage as an example
      const saved = localStorage.getItem("ipay-config")
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch (error) {
      toast.error("Failed to load configuration")
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    try {
      // In a real implementation, this would save to your backend
      // For now, we'll save to localStorage as an example
      localStorage.setItem("ipay-config", JSON.stringify(config))
      toast.success("Configuration saved successfully")
    } catch (error) {
      toast.error("Failed to save configuration")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof IPayConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChannelChange = (channel: keyof IPayConfig['enabledChannels'], enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      enabledChannels: {
        ...prev.enabledChannels,
        [channel]: enabled
      }
    }))
  }

  if (isLoading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center h-32">
          <Text>Loading configuration...</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <Heading level="h2" className="mb-2">
              iPay Payment Configuration
            </Heading>
            <Text className="text-gray-600">
              Configure your iPay Africa payment gateway settings
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="vid" className="text-sm font-medium">
                  Vendor ID (VID)
                </Label>
                <Input
                  id="vid"
                  placeholder="demo"
                  value={config.vid}
                  onChange={(e) => handleInputChange("vid", e.target.value)}
                  className="mt-1"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Your iPay assigned vendor ID
                </Text>
              </div>

              <div>
                <Label htmlFor="hashKey" className="text-sm font-medium">
                  Hash Key
                </Label>
                <Input
                  id="hashKey"
                  type="password"
                  placeholder="Your security hash key"
                  value={config.hashKey}
                  onChange={(e) => handleInputChange("hashKey", e.target.value)}
                  className="mt-1"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Security key provided by iPay (keep this secret)
                </Text>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="live"
                  checked={config.live}
                  onCheckedChange={(checked) => handleInputChange("live", checked)}
                />
                <div>
                  <Label htmlFor="live" className="text-sm font-medium">
                    Live Mode
                  </Label>
                  <Text className="text-xs text-gray-500">
                    Enable for production, disable for testing
                  </Text>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Heading level="h3" className="text-lg font-semibold mb-3">
                  Payment Channels
                </Heading>
                <Text className="text-sm text-gray-600 mb-4">
                  Select which payment methods to enable
                </Text>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="mpesa"
                    checked={config.enabledChannels.mpesa}
                    onCheckedChange={(checked) => handleChannelChange("mpesa", checked)}
                  />
                  <div>
                    <Label htmlFor="mpesa" className="text-sm font-medium">
                      M-Pesa
                    </Label>
                    <Text className="text-xs text-gray-500">
                      Safaricom mobile money
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="airtel"
                    checked={config.enabledChannels.airtel}
                    onCheckedChange={(checked) => handleChannelChange("airtel", checked)}
                  />
                  <div>
                    <Label htmlFor="airtel" className="text-sm font-medium">
                      Airtel Money
                    </Label>
                    <Text className="text-xs text-gray-500">
                      Airtel mobile money
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="creditcard"
                    checked={config.enabledChannels.creditcard}
                    onCheckedChange={(checked) => handleChannelChange("creditcard", checked)}
                  />
                  <div>
                    <Label htmlFor="creditcard" className="text-sm font-medium">
                      Credit/Debit Cards
                    </Label>
                    <Text className="text-xs text-gray-500">
                      Visa, Mastercard payments
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="pesalink"
                    checked={config.enabledChannels.pesalink}
                    onCheckedChange={(checked) => handleChannelChange("pesalink", checked)}
                  />
                  <div>
                    <Label htmlFor="pesalink" className="text-sm font-medium">
                      PesaLink
                    </Label>
                    <Text className="text-xs text-gray-500">
                      Bank transfers via PesaLink
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center">
              <div>
                <Text className="text-sm font-medium">
                  Test Credentials
                </Text>
                <Text className="text-xs text-gray-500">
                  For testing: VID = "demo", Hash Key = "demoCHANGED"
                </Text>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={loadConfiguration}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  onClick={saveConfiguration}
                  disabled={isSaving || !config.vid || !config.hashKey}
                >
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default IPayConfigWidget 