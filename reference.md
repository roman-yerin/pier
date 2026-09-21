# ePWA bridge reference 3.0

Every method, event, error and permission a Pier app can use. Generated from the machine-readable spec the runtime is tested against, so this page cannot drift from the code.

Types are wire types: `string`, `number`, `integer`, `boolean`, `bytes` (`{data, encoding}`), `handle` (`{id, name, kind}`). The result column is what the method returns **before** the `window.epwa` wrapper unpacks it — `epwa.fs.list` hands your code `items`, not the whole object.

## Envelope

Every call is one message in, one message out.

- **request**: `{ id: number, method: string, params: object }`
- **result**: `{ id: number, ok: true, result: object }`
- **error**: `{ id: number, ok: false, error: { code: string, message: string } }`

Binary values travel as `{data, encoding}` with `encoding` either `utf8` or `base64`; the wrapper turns base64 into a `Uint8Array` and back. A missing value is an explicit `null`, never an omitted key.

## Window methods

Available without any manifest permission.

| Call | What it does | Parameters | Result | Errors |
| --- | --- | --- | --- | --- |
| `epwa.ping` | Liveness check of the bridge. | — | { pong: boolean } | — |
| `epwa.getInfo` | Runtime, API version, platform and capabilities. | — | { runtime: string, apiVersion: string, platform: string, osVersion: string, capabilities: string[], permissions: string[], mode: `dev` \| `app` \| `pier` } | — |
| `epwa.setDragRegions` | Push the page's --app-region rectangles to the host. | `drag`?: [Rect](#rect)[]<br>`noDrag`?: [Rect](#rect)[] | { count: integer } | — |
| `epwa.drag.setSources` | Declare the page areas that can be dragged out of the window. | `sources`?: [DragSource](#dragsource)[] | { count: integer } | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.getTrafficLights` | Current traffic-light buttons state. | — | [TrafficLights](#trafficlights) | — |
| `epwa.setTrafficLights` | Move, hide or recolor the traffic-light buttons. | `visible`?: boolean<br>`offsetX`?: number<br>`offsetY`?: number<br>`color`?: `light` \| `dark` \| `auto` | [TrafficLights](#trafficlights) | — |
| `epwa.getTitlebarArea` | Titlebar area in CSS px (like env(titlebar-area-*)). | — | [Rect](#rect) | — |
| `epwa.getWindowState` | Focus, zoom, fullscreen and size of the window. | — | [WindowState](#windowstate) | — |
| `epwa.maximize` | Zoom the window to the visible screen frame. | — | {} | — |
| `epwa.unmaximize` | Return the window to its pre-zoom frame. | — | {} | — |
| `epwa.minimize` | Miniaturize the window into the Dock. | — | {} | — |
| `epwa.close` | Close the window; force: true bypasses the close guard. | `force`?: boolean = `false` | { closed: boolean } | — |
| `epwa.setCloseGuard` | Intercept window close and ⌘Q; the page gets close-request. | `enabled`?: boolean = `false` | { enabled: boolean } | — |
| `epwa.setBackgroundMode` | Closing the window hides it; the process keeps running. | `enabled`?: boolean = `false` | { enabled: boolean } | — |
| `epwa.showWindow` | Show a hidden or minimized window and activate the app. | — | {} | — |
| `epwa.setMenu` | Page menus inserted into the main menu bar. | `menus`?: [MenuSpec](#menuspec)[] | { count: integer } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.setDockMenu` | Dock icon menu. | `items`?: [MenuItem](#menuitem)[] | { count: integer } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.setWindowSize` | Content size in points; the top-left corner stays put. | `width`: number<br>`height`: number<br>`animate`?: boolean = `true` | { width: number, height: number } | `E_BAD_PARAMS` |
| `epwa.setMinWindowSize` | Minimum content size (480×320 by default). | `width`: number<br>`height`: number | { width: number, height: number } | `E_BAD_PARAMS` |
| `epwa.useWindowFrame` | Window position slot: each mode remembers its own frame. | `name`?: string<br>`width`?: number<br>`height`?: number<br>`animate`?: boolean = `true` | { name: string } | `E_BAD_PARAMS` |
| `epwa.setAlwaysOnTop` | Keep the window above the others. | `enabled`?: boolean = `false` | { enabled: boolean } | — |
| `epwa.setFullScreen` | Native full screen; fires fullscreenenter/exit. | `enabled`?: boolean = `false` | { enabled: boolean } | — |
| `epwa.setDockIcon` | Dock icon from a page image; '' resets it. | `url`?: string | { reset: boolean } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.setStatusItem` | Menu bar item; null removes it. | `item`?: [StatusItemSpec](#statusitemspec) \| null | { visible: boolean } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.setWindowMaterial` | Window glass material; null is an ordinary opaque window. | `material`?: `hud` \| `popover` \| `menu` \| `sidebar` \| `sheet` \| `titlebar` \| `headerView` \| `underWindow` \| `windowBackground` \| `contentBackground` \| `fullScreenUI` \| `tooltip` \| `clear` \| null<br>`appearance`?: `auto` \| `dark` \| `light` = `"auto"` | { material: string \| null } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.getWindowCorners` | Current corner radius and the system one. | — | { radius: number \| null, systemRadius: number } | `E_UNAVAILABLE` |
| `epwa.setWindowCorners` | Round the window corners; 'system' or null restores the system shape. | `radius`?: number \| `system` \| null | { radius: number \| null, systemRadius: number } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.setDockProgress` | Progress bar over the Dock icon; null removes it. | `value`?: number \| null<br>`color`?: string | { value: number \| null } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.setGlobalShortcuts` | System-wide hotkeys; the set is replaced as a whole. | `shortcuts`?: [ShortcutSpec](#shortcutspec)[] | { registered: string[], failed: string[] } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.showContextMenu` | Native context menu at a page point; resolves after it closes. | `items`?: [MenuItem](#menuitem)[]<br>`x`?: number = `0`<br>`y`?: number = `0` | { id: string \| null } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.copyToClipboard` | Put text on the general pasteboard. | `text`: string | { length: integer } | `E_BAD_PARAMS` |
| `epwa.haptic` | Force Touch trackpad feedback. | `pattern`?: `generic` \| `alignment` \| `levelChange` \| `level` = `"generic"` | { pattern: string } | `E_BAD_PARAMS` |
| `epwa.setAbout` | Page additions to the About panel. | `details`?: string[]<br>`links`?: [AboutLink](#aboutlink)[]<br>`accent`?: string | { details: integer, links: integer } | `E_BAD_PARAMS`, `E_UNAVAILABLE` |
| `epwa.print` | System print dialog for the page. | — | {} | `E_UNAVAILABLE` |
| `epwa.setFindHandling` | The page takes ⌘F for its own search; reset to false on navigation. | `page`?: boolean = `false` | { page: boolean } | — |
| `epwa.setSettingsHandling` | Standard “Settings…” (⌘,) item in the app menu; choosing it sends the settings event. | `enabled`?: boolean = `false` | { enabled: boolean } | — |
| `epwa.setNavigationGestures` | Two-finger back/forward swipes; off by default. | `enabled`?: boolean = `false` | { enabled: boolean } | — |

## Native modules

### `permissions.*`

What the manifest declares and what the user allowed.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.permissions.query` | State of one permission without asking the user. | `name`: string | [PermissionState](#permissionstate) | — | `E_BAD_PARAMS` |
| `epwa.permissions.request` | Ask for consent up front (for permissions that have a question). | `name`: string | [PermissionState](#permissionstate) | — | `E_BAD_PARAMS` |
| `epwa.permissions.list` | All known permissions with their states. | — | { permissions: [PermissionState](#permissionstate)[] } | — | — |

### `dialog.*`

System sheets: message, confirmation, text input, open and save panels.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.dialog.alert` | Message with up to 4 buttons. | `title`?: string<br>`message`?: string<br>`style`?: `info` \| `warning` \| `critical` = `"info"`<br>`buttons`?: string[] | { button: integer } | — | `E_BAD_PARAMS` |
| `epwa.dialog.confirm` | Yes/no question. | `title`?: string<br>`message`?: string<br>`ok`?: string<br>`cancel`?: string<br>`destructive`?: boolean = `false` | { confirmed: boolean } | — | `E_BAD_PARAMS` |
| `epwa.dialog.prompt` | Single-line text input. | `title`?: string<br>`message`?: string<br>`defaultValue`?: string<br>`placeholder`?: string<br>`secure`?: boolean = `false` | { value: string \| null } | — | `E_BAD_PARAMS` |
| `epwa.dialog.open` | Open panel; the chosen files or folders become handles. | `title`?: string<br>`message`?: string<br>`button`?: string<br>`multiple`?: boolean = `false`<br>`directories`?: boolean = `false`<br>`types`?: string[] | { items?: [Handle](#handle)[], cancelled?: boolean } | `files` | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.dialog.save` | Save panel; the file may not exist yet. | `title`?: string<br>`message`?: string<br>`button`?: string<br>`suggestedName`?: string<br>`types`?: string[] | { item?: [Handle](#handle), cancelled?: boolean } | `files` | `E_BAD_PARAMS`, `E_DENIED` |

### `fs.*`

Files inside handles the user picked and in the app's own folder.

Needs `files` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.fs.appData` | Handle of the app's private folder. | — | [Handle](#handle) | `files` | — |
| `epwa.fs.handles` | Handles issued earlier; they survive restarts. | — | { items: [Handle](#handle)[] } | `files` | — |
| `epwa.fs.forget` | Drop a stored handle. | `handle`: handle | {} | `files` | `E_BAD_PARAMS` |
| `epwa.fs.exists` | Does the path exist inside the handle. | `handle`: handle<br>`path`?: string | { exists: boolean } | `files` | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.fs.stat` | Name, kind, size and dates. | `handle`: handle<br>`path`?: string | [StatEntry](#statentry) | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.list` | Directory contents sorted by name (up to 10 000 entries). | `handle`: handle<br>`path`?: string<br>`hidden`?: boolean = `false` | { items: [DirEntry](#direntry)[], truncated: boolean } | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.read` | Read a file or a slice of it; up to 64 MB per call. | `handle`: handle<br>`path`?: string<br>`as`?: `utf8` \| `base64` = `"base64"`<br>`offset`?: integer = `0`<br>`length`?: integer | { data: string, encoding: `utf8` \| `base64`, size: integer } | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.write` | Write a file atomically (or append); missing folders are created. | `handle`: handle<br>`path`?: string<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"utf8"`<br>`append`?: boolean = `false` | { size: integer } | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.mkdir` | Create a directory with its intermediates. | `handle`: handle<br>`path`: string | {} | `files` | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.fs.remove` | Move to the Trash (or delete for good with trash: false). | `handle`: handle<br>`path`?: string<br>`trash`?: boolean = `true` | {} | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.move` | Move inside the handle or into another handle. | `handle`: handle<br>`from`: string<br>`to`: string<br>`toHandle`?: handle<br>`overwrite`?: boolean = `false` | {} | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.copy` | Copy inside the handle or into another handle. | `handle`: handle<br>`from`: string<br>`to`: string<br>`toHandle`?: handle<br>`overwrite`?: boolean = `false` | {} | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.reveal` | Show the item in Finder. | `handle`: handle<br>`path`?: string | {} | `files` | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.fs.watch` | Watch a folder or file; changes arrive as fs-change. No subfolders. | `handle`: handle<br>`path`?: string | { watch: string } | `files` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.fs.unwatch` | Stop watching. | `watch`: string | {} | `files` | `E_BAD_PARAMS` |

### `launch.*`

Files the app was opened with (file_handlers); no "files" permission needed.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `launch.read`<br>*shim only* | Read a launch file by its handle; up to 64 MB. | `handle`: handle<br>`as`?: `utf8` \| `base64` = `"base64"`<br>`offset`?: integer = `0`<br>`length`?: integer | { data: string, encoding: `utf8` \| `base64`, size: integer } | — | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |

### `net.*`

HTTP without CORS, TCP/TLS/UDP sockets, Bonjour discovery, incoming connections, network status.

Needs `network` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.net.status` | Network status; no permission required. | — | [NetStatus](#netstatus) | — | — |
| `epwa.net.watchStatus` | Subscribe to network-change and return the current status. | — | [NetStatus](#netstatus) | — | — |
| `epwa.net.fetch` | HTTP request without CORS; its own in-memory cookies; up to 64 MB. | `url`: string<br>`method`?: string = `"GET"`<br>`headers`?: map&lt;string, string&gt;<br>`body`?: bytes<br>`bodyEncoding`?: `utf8` \| `base64` = `"utf8"`<br>`redirect`?: `follow` \| `manual` = `"follow"`<br>`timeout`?: number = `60`<br>`as`?: `utf8` \| `base64` = `"utf8"` | { status: integer, url: string, headers: map&lt;string, string&gt;, data: string, encoding: `utf8` \| `base64` } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.connect` | Open a TCP/TLS/UDP socket; up to 64 at a time. | `host`: string<br>`port`: integer<br>`protocol`?: `tcp` \| `udp` = `"tcp"`<br>`tls`?: boolean = `false`<br>`timeout`?: number = `15` | { socket: string } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.send` | Send bytes or text into an open socket. | `socket`: string<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"utf8"` | { sent: integer } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.close` | Close a socket; socket-close follows. | `socket`: string | {} | `network` + consent | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.net.browse` | Browse the local network for a Bonjour service type declared in the manifest. | `type`: string<br>`domain`?: string | { browse: string } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.resolve` | Resolve a found service to an address, port and TXT record. | `browse`: string<br>`name`: string<br>`timeout`?: number = `10` | { host: string, port: integer, addresses: string[], txt: map&lt;string, string&gt; } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.stopBrowse` | Stop a browse; no more net-service-found events. | `browse`: string | {} | `network` + consent | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.net.listen` | Accept incoming connections; loopback by default, "lan" asks the user separately. | `port`?: integer = `0`<br>`protocol`?: `tcp` \| `udp` = `"tcp"`<br>`interface`?: `loopback` \| `lan` = `"loopback"`<br>`advertise`?: { name: string, type: string, txt?: map&lt;string, string&gt; }<br>`timeout`?: number = `10` | { listener: string, port: integer } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.sendTo` | Send a datagram back to a peer the UDP listener already heard from. | `listener`: string<br>`host`: string<br>`port`: integer<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"utf8"` | { sent: integer } | `network` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.net.stopListen` | Stop a listener; accepted TCP sockets stay open. | `listener`: string | {} | `network` + consent | `E_BAD_PARAMS`, `E_DENIED` |

### `serial.*`

Serial ports (USB adapters, Arduino); the user picks the port.

Needs `serial` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.serial.getPorts` | Ports chosen earlier and connected now. | — | { ports: [SerialPort](#serialport)[] } | `serial` | `E_DENIED` |
| `epwa.serial.requestPort` | Ask the user to pick a port. | `filters`?: [UsbFilter](#usbfilter)[] | [SerialPort](#serialport) | `serial` | `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED` |
| `epwa.serial.forget` | Forget the port choice and close it. | `port`: string | {} | `serial` | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.serial.open` | Open the port exclusively; then serial-data / serial-close. | `port`: string<br>`baudRate`?: integer = `9600`<br>`dataBits`?: integer = `8`<br>`stopBits`?: integer = `1`<br>`parity`?: `none` \| `even` \| `odd` = `"none"`<br>`flowControl`?: `none` \| `hardware` \| `software` = `"none"` | {} | `serial` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.serial.write` | Write bytes or text to the port. | `port`: string<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"utf8"` | { written: integer } | `serial` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.serial.setSignals` | Set DTR / RTS / break (an Arduino reset, for example). | `port`: string<br>`dtr`?: boolean<br>`rts`?: boolean<br>`brk`?: boolean | {} | `serial` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.serial.close` | Close the port. | `port`: string | {} | `serial` | `E_BAD_PARAMS`, `E_DENIED` |

### `usb.*`

USB devices without a system driver (like WebUSB).

Needs `usb` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.usb.getDevices` | Devices chosen earlier and connected now. | — | { devices: [UsbDevice](#usbdevice)[] } | `usb` | `E_DENIED` |
| `epwa.usb.requestDevice` | Ask the user to pick a device. | `filters`?: [UsbFilter](#usbfilter)[] | [UsbDevice](#usbdevice) | `usb` | `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED` |
| `epwa.usb.forget` | Forget the device choice. | `device`: string | {} | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.open` | Open the device. | `device`: string | {} | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.close` | Close the device. | `device`: string | {} | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.selectConfiguration` | Select a USB configuration. | `device`: string<br>`value`: integer | {} | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.claimInterface` | Claim an interface. | `device`: string<br>`interface`: integer | {} | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.releaseInterface` | Release an interface. | `device`: string<br>`interface`: integer | {} | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.controlTransferIn` | Control transfer, device → page. | `device`: string<br>`requestType`?: `standard` \| `class` \| `vendor` = `"vendor"`<br>`recipient`?: `device` \| `interface` \| `endpoint` \| `other` = `"device"`<br>`request`: integer<br>`value`?: integer = `0`<br>`index`?: integer = `0`<br>`length`: integer<br>`timeout`?: number = `5` | [Binary](#binary) | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.controlTransferOut` | Control transfer, page → device. | `device`: string<br>`requestType`?: `standard` \| `class` \| `vendor` = `"vendor"`<br>`recipient`?: `device` \| `interface` \| `endpoint` \| `other` = `"device"`<br>`request`: integer<br>`value`?: integer = `0`<br>`index`?: integer = `0`<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"base64"`<br>`timeout`?: number = `5` | { written: integer } | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.transferIn` | Bulk/interrupt transfer, device → page (endpoint 1…15). | `device`: string<br>`endpoint`: integer<br>`length`: integer<br>`timeout`?: number = `5` | [Binary](#binary) | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.usb.transferOut` | Bulk/interrupt transfer, page → device. | `device`: string<br>`endpoint`: integer<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"base64"`<br>`timeout`?: number = `5` | { written: integer } | `usb` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |

### `hid.*`

HID devices you choose (like WebHID); keyboards, pointing devices and security keys are never offered.

Needs `hid` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.hid.getDevices` | Devices chosen earlier and connected now. | — | { devices: [HidDevice](#hiddevice)[] } | `hid` | `E_DENIED` |
| `epwa.hid.requestDevice` | Ask the user to pick a device. | `filters`?: [HidFilter](#hidfilter)[] | [HidDevice](#hiddevice) | `hid` | `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED` |
| `epwa.hid.forget` | Forget the device choice. | `device`: string | {} | `hid` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.hid.open` | Open the device. | `device`: string | {} | `hid` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.hid.close` | Close the device. | `device`: string | {} | `hid` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.hid.sendReport` | Send an output report. | `device`: string<br>`reportId`?: integer = `0`<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"base64"` | { written: integer } | `hid` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.hid.sendFeatureReport` | Send a feature report. | `device`: string<br>`reportId`?: integer = `0`<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"base64"` | { written: integer } | `hid` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.hid.receiveFeatureReport` | Read a feature report. | `device`: string<br>`reportId`?: integer = `0` | [Binary](#binary) | `hid` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |

### `bluetooth.*`

Bluetooth LE, like Web Bluetooth: the user picks the device.

Needs `bluetooth` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.bluetooth.getAvailability` | Is Bluetooth LE available and in what state. | — | { available: boolean, state: `poweredOn` \| `poweredOff` \| `unauthorized` \| `unsupported` \| `resetting` \| `unknown` } | `bluetooth` | `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.requestDevice` | Scan and let the user pick a device. | `filters`?: [BluetoothFilter](#bluetoothfilter)[]<br>`optionalServices`?: string[] | [BluetoothDevice](#bluetoothdevice) | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED` |
| `epwa.bluetooth.getDevices` | Devices chosen earlier. | — | { devices: [BluetoothDevice](#bluetoothdevice)[] } | `bluetooth` | `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.forget` | Forget the device and disconnect. | `device`: string | {} | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.connect` | Connect and discover the allowed services. | `device`: string<br>`timeout`?: number = `15` | { services: [BluetoothService](#bluetoothservice)[] } | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.disconnect` | Disconnect from the device. | `device`: string | {} | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.read` | Read a characteristic value. | `device`: string<br>`service`: string<br>`characteristic`: string<br>`timeout`?: number = `10` | [Binary](#binary) | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.write` | Write a characteristic value. | `device`: string<br>`service`: string<br>`characteristic`: string<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"base64"`<br>`withResponse`?: boolean = `true`<br>`timeout`?: number = `10` | { written: integer } | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.startNotifications` | Subscribe to characteristic values (bluetooth-value). | `device`: string<br>`service`: string<br>`characteristic`: string<br>`timeout`?: number = `10` | {} | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.bluetooth.stopNotifications` | Unsubscribe from characteristic values. | `device`: string<br>`service`: string<br>`characteristic`: string<br>`timeout`?: number = `10` | {} | `bluetooth` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |

### `midi.*`

MIDI devices through CoreMIDI; the base of the Web MIDI shim.

Needs `midi` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.midi.access` | Port lists and the clock origin; sysex: true asks for a separate consent. | `sysex`?: boolean = `false` | { inputs: [MidiPort](#midiport)[], outputs: [MidiPort](#midiport)[], sysex: boolean, now: number } | `midi` + consent | `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.midi.open` | Open a MIDI input; messages arrive as midi-message. Up to 32 at a time. | `port`: string | {} | `midi` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.midi.close` | Close a MIDI input. | `port`: string | {} | `midi` + consent | `E_BAD_PARAMS`, `E_DENIED` |
| `epwa.midi.send` | Send messages to an output; up to 64 KB, SysEx only after midi.access({sysex: true}). | `port`: string<br>`data`: bytes<br>`encoding`?: `utf8` \| `base64` = `"base64"`<br>`timestamp`?: number | { sent: integer } | `midi` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |

### `power.*`

Keep the system (or display) awake; power source, battery, user idle time and system events.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.power.preventSleep` | Take a sleep assertion; hold the token while the work lasts. | `display`?: boolean = `false`<br>`reason`?: string | { token: string } | — | `E_UNAVAILABLE` |
| `epwa.power.allowSleep` | Release the assertion. | `token`: string | {} | — | `E_BAD_PARAMS` |
| `epwa.power.status` | Power source and battery level. | — | { source: `ac` \| `battery`, battery?: { level: number, charging: boolean } } | — | — |
| `epwa.power.idleTime` | Seconds since the last user input, rounded and throttled to once a second. | — | { seconds: number } | — | — |
| `epwa.power.watchSystem` | Subscribe to sleep, wake, display and screen-lock events. | — | {} | — | — |
| `epwa.power.unwatchSystem` | Unsubscribe from the system events. | — | {} | — | — |

### `location.*`

CoreLocation fixes in the W3C shape.

Needs `location` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.location.getCurrentPosition` | One position fix. | `accuracy`?: `fine` \| `coarse` = `"fine"`<br>`timeout`?: number = `15`<br>`maximumAge`?: number = `0` | [Position](#position) | `location` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.location.watchPosition` | Subscribe to location-update / location-error; up to 16 watches. | `accuracy`?: `fine` \| `coarse` = `"fine"`<br>`timeout`?: number = `15`<br>`maximumAge`?: number = `0` | { token: string } | `location` + consent | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.location.clearWatch` | Cancel a watch. | `token`: string | {} | `location` + consent | `E_BAD_PARAMS`, `E_DENIED` |

### `notifications.*`

macOS notifications with buttons, a reply field, attachments and scheduling.

Needs `notifications` in the manifest.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.notifications.getPermission` | System notification authorization state. | — | { state: `granted` \| `denied` \| `prompt` } | `notifications` | `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.notifications.requestPermission` | Ask the system for notification authorization. | — | { state: `granted` \| `denied` \| `prompt` } | `notifications` | `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.notifications.show` | Show (or schedule) a notification; the same id replaces the previous one. | `title`: string<br>`body`?: string<br>`subtitle`?: string<br>`sound`?: boolean = `true`<br>`id`?: string<br>`actions`?: [NotificationAction](#notificationaction)[]<br>`replyButton`?: { title?: string }<br>`reply`?: boolean = `false`<br>`attachments`?: [NotificationAttachment](#notificationattachment)[]<br>`schedule`?: [NotificationSchedule](#notificationschedule) | { id: string } | `notifications` | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.notifications.clear` | Remove a notification by id, or all of them. | `id`?: string | {} | `notifications` | `E_DENIED`, `E_UNAVAILABLE` |

### `secrets.*`

Strings in the app's own Keychain service.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.secrets.set` | Store a value (up to 64 KB). | `key`: string<br>`value`: string<br>`protected`?: boolean = `false` | {} | — | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.secrets.get` | Read a value; null when there is none. | `key`: string<br>`reason`?: string | { value: string \| null } | — | `E_BAD_PARAMS`, `E_CANCELLED`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.secrets.delete` | Remove a value. | `key`: string | {} | — | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.secrets.keys` | All stored keys, sorted. | — | { keys: string[], protected: string[] } | — | `E_DENIED`, `E_UNAVAILABLE` |

### `auth.*`

System owner check (Touch ID, falling back to the account password) — no manifest permission.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.auth.available` | Whether the system can ask (Touch ID or account password). | — | { biometry: `touchID` \| `none`, canAuthenticate: boolean } | — | — |
| `epwa.auth.confirm` | Ask the system to confirm it's the Mac's owner; the system shows reason. | `reason`?: string | { ok: boolean } | — | `E_CANCELLED`, `E_DENIED`, `E_UNAVAILABLE` |

### `clipboard.*`

System pasteboard: multiple representations, reading, file handles.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.clipboard.write` | Replace the clipboard with several representations of the same content. | `items`: [ClipboardItem](#clipboarditem)[] | { count: integer } | — | `E_BAD_PARAMS` |
| `epwa.clipboard.read` | Read the clipboard; empty and concealed: true when it holds a password manager's hidden content. | `types`?: string[] | { items: [ClipboardItem](#clipboarditem)[], concealed: boolean } | `clipboard-read` + consent | `E_DENIED` |
| `epwa.clipboard.types` | Which representations are available, without reading content. | — | { types: string[], concealed: boolean } | `clipboard-read` + consent | `E_DENIED` |
| `epwa.clipboard.clear` | Empty the clipboard. | — | {} | — | — |

### `app.*`

Dock badge, attention, external links, sharing, launch at login, storage reset.

No manifest permission needed.

| Call | What it does | Parameters | Result | Permission | Errors |
| --- | --- | --- | --- | --- | --- |
| `epwa.app.setBadge` | Dock badge text; empty removes it. | `text`?: string | { text: string } | — | — |
| `epwa.app.requestAttention` | Bounce the Dock icon. | `critical`?: boolean = `false` | {} | — | — |
| `epwa.app.openExternal` | Open a link in the system: http(s), mailto:, tel:, facetime:, sms:. | `url`: string | { opened: boolean } | — | `E_BAD_PARAMS` |
| `epwa.app.share` | System share sheet at a point of the window. | `text`?: string<br>`url`?: string<br>`files`?: handle[]<br>`x`?: number<br>`y`?: number | { items: integer } | — | `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE` |
| `epwa.app.clearData` | Clear the app's whole website storage (all origins). | `types`?: `cookies` \| `diskCache` \| `localStorage` \| `sessionStorage` \| `indexedDB` \| `serviceWorkers` \| `cacheStorage`[] | { cleared: integer } | — | `E_BAD_PARAMS` |
| `epwa.app.getLaunchAtLogin` | Launch at login state. | — | [LaunchAtLogin](#launchatlogin) | — | `E_UNAVAILABLE` |
| `epwa.app.setLaunchAtLogin` | Turn launch at login on or off. | `enabled`?: boolean = `false` | [LaunchAtLogin](#launchatlogin) | — | `E_UNAVAILABLE` |

## Events

`epwa.on(event, handler)` returns an unsubscribe function.

| Event | What it means | Payload | Turned on by |
| --- | --- | --- | --- |
| `ready` | The bridge answered the bootstrap handshake. | { apiVersion: string } | the runtime itself |
| `titlebarareachange` | The titlebar area changed (resize). | [Rect](#rect) | the runtime itself |
| `themechange` | The system appearance changed. | { scheme: `dark` \| `light` } | the runtime itself |
| `maximize` | The window was zoomed. | { manual?: boolean } | the runtime itself |
| `unmaximize` | The window left the zoomed frame. | { manual?: boolean } | the runtime itself |
| `fullscreenenter` | The window entered full screen. | {} | the runtime itself |
| `fullscreenexit` | The window left full screen. | {} | the runtime itself |
| `focus` | The window became key. | {} | the runtime itself |
| `blur` | The window lost key status. | {} | the runtime itself |
| `close-request` | Close was intercepted by the close guard. | { reason: `close` \| `quit` } | `setCloseGuard` |
| `hide` | The window was hidden by closing it in background mode. | {} | `setBackgroundMode` |
| `show` | The window came back. | {} | the runtime itself |
| `menu` | A page menu, Dock menu or status item entry was chosen. | { id: string, source: `menu` \| `dock` \| `status` } | `setMenu` |
| `settings` | The Settings… item (or ⌘,) was chosen. | {} | `setSettingsHandling` |
| `shortcut` | A global hotkey fired. | { id: string } | `setGlobalShortcuts` |
| `notification-click` | The user clicked a notification. | { id: string } | `notifications.show` |
| `notification-action` | An action button was pressed. | { id: string, actionId: string } | `notifications.show` |
| `notification-reply` | The user typed a quick reply. | { id: string, text: string } | `notifications.show` |
| `download` | A WebKit download changed state. | { name: string, state: `started` \| `finished` \| `failed`, error?: string } | the runtime itself |
| `popup-blocked` | window.open was blocked. | { url: string, reason: `no-user-gesture` \| `too-many-popups` \| `nested-popup` \| `foreign-frame` } | the runtime itself |
| `launch-files` | The app was opened with files (feeds the launchQueue shim). | { files: [Handle](#handle)[], batch?: string } | the runtime itself |
| `files-dropped` | Files or folders were dropped on the window (handles for epwa.fs). | { files: [Handle](#handle)[], x: number, y: number } | the runtime itself |
| `drag-end` | A drag session started from the window ended. | { operation: `none` \| `copy` \| `move` \| `link` } | the runtime itself |
| `fs-change` | A watched file or folder changed. | { watch: string, event: `write` \| `delete` \| `rename` \| `attrib` } | `fs.watch` |
| `network-change` | The network path changed. | [NetStatus](#netstatus) | `net.watchStatus` |
| `socket-data` | Bytes arrived on a socket. | { socket: string, data: bytes } | `net.connect` |
| `socket-close` | A socket closed. | { socket: string, error?: string } | `net.connect` |
| `net-service-found` | A Bonjour service appeared on the local network. | { browse: string, service: [NetService](#netservice) } | `net.browse` |
| `net-service-lost` | A Bonjour service disappeared. | { browse: string, service: [NetService](#netservice) } | `net.browse` |
| `net-connection` | A listener accepted an incoming connection. | { listener: string, socket: string, remote: { host: string, port: integer } } | `net.listen` |
| `net-datagram` | A datagram arrived at a UDP listener. | { listener: string, data: bytes, remote: { host: string, port: integer } } | `net.listen` |
| `serial-data` | Bytes arrived from a serial port. | { port: string, data: bytes } | `serial.open` |
| `serial-close` | The port closed, including when the adapter was unplugged. | { port: string, error?: string } | `serial.open` |
| `usb-connect` | A chosen USB device was plugged in. | { device: [UsbDevice](#usbdevice) } | `usb.getDevices` |
| `usb-disconnect` | A chosen USB device was unplugged. | { device: [UsbDevice](#usbdevice) } | `usb.getDevices` |
| `hid-inputreport` | An input report arrived from an open HID device. | { device: string, reportId: integer, data: bytes } | `hid.open` |
| `hid-connect` | A chosen HID device was plugged in. | { device: [HidDevice](#hiddevice) } | `hid.getDevices` |
| `hid-disconnect` | A chosen HID device was unplugged. | { device: [HidDevice](#hiddevice) } | `hid.getDevices` |
| `bluetooth-value` | A subscribed characteristic sent a value. | { device: string, service: string, characteristic: string, data: bytes } | `bluetooth.startNotifications` |
| `bluetooth-disconnect` | The device disconnected. | { device: string, error?: string } | `bluetooth.connect` |
| `midi-message` | A message arrived from an open MIDI input. | { port: string, data: bytes, timestamp: number } | `midi.open` |
| `midi-statechange` | A MIDI port appeared or disappeared. | { port: [MidiPortState](#midiportstate) } | `midi.access` |
| `location-update` | A new position fix for a watch. | { token: string, coords: [Coords](#coords), timestamp: number } | `location.watchPosition` |
| `location-error` | A watch failed. | { token: string, code: string, message: string } | `location.watchPosition` |
| `system-sleep` | The Mac is going to sleep. | {} | `power.watchSystem` |
| `system-wake` | The Mac woke up. | {} | `power.watchSystem` |
| `screens-sleep` | The displays went to sleep. | {} | `power.watchSystem` |
| `screens-wake` | The displays woke up. | {} | `power.watchSystem` |
| `screen-lock` | The screen was locked. | {} | `power.watchSystem` |
| `screen-unlock` | The screen was unlocked. | {} | `power.watchSystem` |

## Error codes

| Code | Meaning |
| --- | --- |
| `E_UNKNOWN_METHOD` | No such bridge method or namespace. |
| `E_BAD_PARAMS` | Parameters are missing or of the wrong type. |
| `E_UNSUPPORTED` | The host does not support this (for example an API version mismatch). |
| `E_UNAVAILABLE` | Temporarily impossible: no window, device not connected, system refused. |
| `E_DENIED` | Not allowed: foreign origin, permission not declared in the manifest, or the user said no. |
| `E_CANCELLED` | The user cancelled the dialog or the device picker. |

## Manifest permissions

Declared as `"epwa": {"permissions": [...]}` in `manifest.webmanifest`.

| Permission | The app may use | Asks the person |
| --- | --- | --- |
| `files` | files and folders you choose | no |
| `network` | direct connections to servers and devices on the network | yes |
| `bluetooth` | Bluetooth devices you choose | no |
| `usb` | USB devices you choose | no |
| `hid` | HID devices you choose | no |
| `serial` | serial ports (Arduino and the like) you choose | no |
| `midi` | MIDI devices | yes |
| `notifications` | notifications | no |
| `camera` | the camera, with your permission | yes |
| `microphone` | the microphone, with your permission | yes |
| `location` | your location, with your permission | yes |
| `clipboard-read` | reading the clipboard | yes |
| `screen` | screen sharing — you pick what to show | no |

## Capabilities

`(await epwa.getInfo()).capabilities` reports this list plus the namespaces the app actually got.

`dragRegions`, `trafficLights`, `titlebarArea`, `window`, `closeGuard`, `backgroundMode`, `menu`, `dockMenu`, `mediaSession`, `windowSize`, `alwaysOnTop`, `fullScreen`, `dockIcon`, `statusItem`, `windowMaterial`, `dockProgress`, `globalShortcuts`, `contextMenu`, `clipboard`, `haptic`, `windowFrames`, `about`, `print`, `findHandling`, `settings`, `fileDrop`, `dragSources`

## Web API shims

Standard APIs Pier implements on top of the bridge.

| Replaces | Built on | When | Note |
| --- | --- | --- | --- |
| `window.print` | `print` | always | WKWebView has window.print but it does nothing, so the shim is installed unconditionally. |
| `navigator.wakeLock` | `power.preventSleep`, `power.allowSleep` | only if the platform has none | Screen Wake Lock API over epwa.power; sentinels auto-release when the document is hidden. |
| `window.launchQueue` | `launch.read` | only if the platform has none | Launch Queue for file_handlers: handles with getFile(); up to 64 MB per file. |
| `window.Notification` | `notifications.show`, `notifications.clear`, `notifications.getPermission`, `notifications.requestPermission` | only if the platform has none | Notification API over epwa.notifications; tag maps to the native id. |
| `navigator.setAppBadge / navigator.clearAppBadge` | `app.setBadge` | only if the platform has none | Badging API; errors are swallowed the way browsers do. |
| `navigator.share` | `app.share` | only if the platform has none | Web Share API without files; no data is a TypeError. |
| `navigator.geolocation` | `location.getCurrentPosition`, `location.watchPosition`, `location.clearWatch` | always | Installed unconditionally: WKWebView has geolocation before macOS 27 but requests never complete. |
| `navigator.requestMIDIAccess` | `midi.access`, `midi.open`, `midi.close`, `midi.send` | only if the platform has none | Web MIDI API over epwa.midi: MIDIAccess, MIDIInput/MIDIOutput, onmidimessage. |
| `navigator.hid` | `hid.getDevices`, `hid.requestDevice`, `hid.forget`, `hid.open`, `hid.close`, `hid.sendReport`, `hid.sendFeatureReport`, `hid.receiveFeatureReport` | only if the platform has none | WebHID over epwa.hid: navigator.hid, HIDDevice, inputreport, connect/disconnect. |
| `navigator.mediaDevices.getDisplayMedia` |  | always | Screen sharing is unavailable: the shim rejects with NotSupportedError instead of WebKit hanging or silently capturing the app's own window. |

## Structures

### Rect

| Field | Type | Required |
| --- | --- | --- |
| `x` | number | yes |
| `y` | number | yes |
| `width` | number | yes |
| `height` | number | yes |

### TrafficLights

| Field | Type | Required |
| --- | --- | --- |
| `visible` | boolean | yes |
| `offsetX` | number | yes |
| `offsetY` | number | yes |
| `color` | `light` \| `dark` \| `auto` | yes |

### WindowState

| Field | Type | Required |
| --- | --- | --- |
| `focused` | boolean | yes |
| `maximized` | boolean | yes |
| `fullscreen` | boolean | yes |
| `minimized` | boolean | yes |
| `alwaysOnTop` | boolean | yes |
| `width` | number | yes |
| `height` | number | yes |

### MenuItem

A menu item, or { separator: true }.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | no |
| `title` | string | no |
| `key` | string | no |
| `modifiers` | `cmd` \| `shift` \| `alt` \| `ctrl`[] | no |
| `enabled` | boolean | no |
| `checked` | boolean | no |
| `separator` | boolean | no |

### MenuSpec

| Field | Type | Required |
| --- | --- | --- |
| `title` | string | yes |
| `items` | [MenuItem](#menuitem)[] | yes |

### StatusItemSpec

| Field | Type | Required |
| --- | --- | --- |
| `symbol` | string | no |
| `title` | string | no |
| `tooltip` | string | no |
| `items` | [MenuItem](#menuitem)[] | no |

### ShortcutSpec

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `key` | string | yes |
| `modifiers` | string[] | no |

### AboutLink

| Field | Type | Required |
| --- | --- | --- |
| `title` | string | yes |
| `url` | string | yes |

### Handle

Opaque file handle from dialog.open/save, fs.appData or launch files.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |
| `kind` | `file` \| `directory` | yes |

### DirEntry

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `kind` | `file` \| `directory` | yes |
| `size` | integer | yes |
| `modified` | number | yes |

### StatEntry

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `kind` | `file` \| `directory` | yes |
| `size` | integer | yes |
| `modified` | number | yes |
| `created` | number | yes |

### NetStatus

| Field | Type | Required |
| --- | --- | --- |
| `online` | boolean | yes |
| `expensive` | boolean | yes |
| `constrained` | boolean | yes |
| `interfaces` | `wifi` \| `wired` \| `cellular` \| `other`[] | yes |

### NetService

A Bonjour service instance found by net.browse.

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `type` | string | yes |
| `domain` | string | yes |

### SerialPort

| Field | Type | Required |
| --- | --- | --- |
| `path` | string | yes |
| `name` | string | yes |
| `vendorId` | integer | no |
| `productId` | integer | no |
| `serialNumber` | string | no |

### UsbDevice

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `vendorId` | integer | yes |
| `productId` | integer | yes |
| `productName` | string | no |
| `manufacturerName` | string | no |
| `serialNumber` | string | no |
| `deviceClass` | integer | no |

### UsbFilter

| Field | Type | Required |
| --- | --- | --- |
| `vendorId` | integer | no |
| `productId` | integer | no |
| `classCode` | integer | no |

### HidReport

A report inside a collection; reportSize is the body length in bytes.

| Field | Type | Required |
| --- | --- | --- |
| `reportId` | integer | yes |
| `reportSize` | integer | yes |

### HidCollection

A top-level collection of the device.

| Field | Type | Required |
| --- | --- | --- |
| `usagePage` | integer | yes |
| `usage` | integer | yes |
| `inputReports` | [HidReport](#hidreport)[] | yes |
| `outputReports` | [HidReport](#hidreport)[] | yes |
| `featureReports` | [HidReport](#hidreport)[] | yes |

### HidDevice

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `vendorId` | integer | yes |
| `productId` | integer | yes |
| `productName` | string | no |
| `serialNumber` | string | no |
| `collections` | [HidCollection](#hidcollection)[] | yes |

### HidFilter

| Field | Type | Required |
| --- | --- | --- |
| `vendorId` | integer | no |
| `productId` | integer | no |
| `usagePage` | integer | no |
| `usage` | integer | no |

### BluetoothDevice

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |

### BluetoothFilter

| Field | Type | Required |
| --- | --- | --- |
| `services` | string[] | no |
| `name` | string | no |
| `namePrefix` | string | no |

### BluetoothService

| Field | Type | Required |
| --- | --- | --- |
| `uuid` | string | yes |
| `characteristics` | { uuid: string, properties: string[] }[] | yes |

### MidiPort

A MIDI port as midi.access lists it.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |
| `manufacturer` | string | yes |
| `connected` | boolean | yes |

### MidiPortState

A MIDI port in a midi-statechange payload: same fields plus its direction.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |
| `manufacturer` | string | yes |
| `type` | `input` \| `output` | yes |
| `connected` | boolean | yes |

### Coords

| Field | Type | Required |
| --- | --- | --- |
| `latitude` | number | yes |
| `longitude` | number | yes |
| `accuracy` | number | yes |
| `altitude` | number | no |
| `altitudeAccuracy` | number | no |
| `speed` | number | no |
| `heading` | number | no |

### Position

| Field | Type | Required |
| --- | --- | --- |
| `coords` | [Coords](#coords) | yes |
| `timestamp` | number | yes |

### PermissionState

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `declared` | boolean | yes |
| `state` | `granted` \| `prompt` \| `denied` | yes |

### NotificationAction

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `title` | string | yes |
| `destructive` | boolean | no |

### NotificationAttachment

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | no |
| `data` | string | no |
| `handle` | string | no |

### NotificationSchedule

| Field | Type | Required |
| --- | --- | --- |
| `at` | number | no |
| `seconds` | number | no |

### LaunchAtLogin

| Field | Type | Required |
| --- | --- | --- |
| `enabled` | boolean | yes |
| `state` | `enabled` \| `disabled` \| `requiresApproval` \| `notFound` | yes |

### AppRecord

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `bundleId` | string | yes |
| `path` | string | yes |
| `startURL` | string \| null | yes |
| `manifestURL` | string \| null | yes |
| `permissions` | string[] | yes |
| `icon` | string \| null | yes |

### DiagnosticsApp

| Field | Type | Required |
| --- | --- | --- |
| `bundleId` | string | yes |
| `name` | string | yes |
| `runtimeVersion` | string \| null | yes |
| `hostVersion` | string \| null | yes |
| `outdated` | boolean | yes |
| `permissions` | string[] | yes |

### Binary

Binary payload on the wire.

| Field | Type | Required |
| --- | --- | --- |
| `data` | string | yes |
| `encoding` | `utf8` \| `base64` | yes |

### DragItem

Page data for a drag session: a MIME type or UTI and its string payload.

| Field | Type | Required |
| --- | --- | --- |
| `type` | string | yes |
| `data` | string | yes |

### DragSource

A page area that can be dragged out of the window.

| Field | Type | Required |
| --- | --- | --- |
| `rect` | [Rect](#rect) | yes |
| `files` | handle[] | no |
| `items` | [DragItem](#dragitem)[] | no |
| `image` | string | no |

### ClipboardItem

One representation of clipboard content.

| Field | Type | Required |
| --- | --- | --- |
| `type` | `text/plain` \| `text/html` \| `image/png` \| `text/uri-list` \| `application/x-epwa-file` | yes |
| `data` | string | no |
| `encoding` | `utf8` \| `base64` | no |
| `handle` | [Handle](#handle) | no |

