"use strict";
const jsxRuntime = require("react/jsx-runtime");
const adminSdk = require("@medusajs/admin-sdk");
const ui = require("@medusajs/ui");
const react = require("react");
const IPayConfigWidget = () => {
  const [config2, setConfig] = react.useState({
    vid: "",
    hashKey: "",
    live: false,
    enabledChannels: {
      mpesa: true,
      airtel: true,
      creditcard: false,
      pesalink: false
    }
  });
  const [isLoading, setIsLoading] = react.useState(false);
  const [isSaving, setIsSaving] = react.useState(false);
  react.useEffect(() => {
    loadConfiguration();
  }, []);
  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem("ipay-config");
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (error) {
      ui.toast.error("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };
  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("ipay-config", JSON.stringify(config2));
      ui.toast.success("Configuration saved successfully");
    } catch (error) {
      ui.toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };
  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleChannelChange = (channel, enabled) => {
    setConfig((prev) => ({
      ...prev,
      enabledChannels: {
        ...prev.enabledChannels,
        [channel]: enabled
      }
    }));
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { className: "p-6", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Loading configuration..." }) }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { className: "p-6", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-2", children: "iPay Payment Configuration" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-gray-600", children: "Configure your iPay Africa payment gateway settings" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "vid", className: "text-sm font-medium", children: "Vendor ID (VID)" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "vid",
              placeholder: "demo",
              value: config2.vid,
              onChange: (e) => handleInputChange("vid", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500 mt-1", children: "Your iPay assigned vendor ID" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "hashKey", className: "text-sm font-medium", children: "Hash Key" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "hashKey",
              type: "password",
              placeholder: "Your security hash key",
              value: config2.hashKey,
              onChange: (e) => handleInputChange("hashKey", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500 mt-1", children: "Security key provided by iPay (keep this secret)" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Switch,
            {
              id: "live",
              checked: config2.live,
              onCheckedChange: (checked) => handleInputChange("live", checked)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "live", className: "text-sm font-medium", children: "Live Mode" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500", children: "Enable for production, disable for testing" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h3", className: "text-lg font-semibold mb-3", children: "Payment Channels" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm text-gray-600 mb-4", children: "Select which payment methods to enable" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Switch,
              {
                id: "mpesa",
                checked: config2.enabledChannels.mpesa,
                onCheckedChange: (checked) => handleChannelChange("mpesa", checked)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "mpesa", className: "text-sm font-medium", children: "M-Pesa" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500", children: "Safaricom mobile money" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Switch,
              {
                id: "airtel",
                checked: config2.enabledChannels.airtel,
                onCheckedChange: (checked) => handleChannelChange("airtel", checked)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "airtel", className: "text-sm font-medium", children: "Airtel Money" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500", children: "Airtel mobile money" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Switch,
              {
                id: "creditcard",
                checked: config2.enabledChannels.creditcard,
                onCheckedChange: (checked) => handleChannelChange("creditcard", checked)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "creditcard", className: "text-sm font-medium", children: "Credit/Debit Cards" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500", children: "Visa, Mastercard payments" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Switch,
              {
                id: "pesalink",
                checked: config2.enabledChannels.pesalink,
                onCheckedChange: (checked) => handleChannelChange("pesalink", checked)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "pesalink", className: "text-sm font-medium", children: "PesaLink" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500", children: "Bank transfers via PesaLink" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t pt-6", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm font-medium", children: "Test Credentials" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-xs text-gray-500", children: 'For testing: VID = "demo", Hash Key = "demoCHANGED"' })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex space-x-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Button,
          {
            variant: "secondary",
            onClick: loadConfiguration,
            disabled: isLoading,
            children: "Reset"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Button,
          {
            onClick: saveConfiguration,
            disabled: isSaving || !config2.vid || !config2.hashKey,
            children: isSaving ? "Saving..." : "Save Configuration"
          }
        )
      ] })
    ] }) })
  ] }) }) });
};
adminSdk.defineWidgetConfig({
  zone: "product.details.before"
});
const widgetModule = { widgets: [
  {
    Component: IPayConfigWidget,
    zone: ["product.details.before"]
  }
] };
const routeModule = {
  routes: []
};
const menuItemModule = {
  menuItems: []
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule
};
module.exports = plugin;
