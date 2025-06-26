# Module Campaign và Donation

## 1. Tổng quan

Module **Campaign** và **Donation** là hai module cốt lõi của hệ thống, được thiết kế để quản lý toàn bộ quy trình từ việc tạo một chiến dịch hiến máu cho đến khi người dùng đăng ký, hiến máu và nhận kết quả.

- **Campaign (Chiến dịch):** Do `ADMIN` quản lý, chịu trách nhiệm tạo và cấu hình các sự kiện hiến máu. Mỗi chiến dịch có thông tin cụ thể về thời gian, địa điểm, mục tiêu và các thông tin liên quan khác.
- **Donation (Hiến máu):** Quản lý các hoạt động liên quan trực tiếp đến người hiến máu (`CUSTOMER`) và nhân viên y tế (`STAFF`). Bao gồm việc đăng ký hiến máu, xác nhận lịch hẹn, cập nhật trạng thái và trả kết quả.

Hai module này hoạt động chặt chẽ với nhau để đảm bảo quy trình hiến máu diễn ra một cách minh bạch, hiệu quả và dễ dàng theo dõi cho tất cả các bên liên quan.

## 2. Luồng hoạt động của một yêu cầu hiến máu

Quy trình xử lý một yêu cầu hiến máu (Donation Request) trải qua nhiều trạng thái khác nhau, được quản lý bởi các vai trò khác nhau. Dưới đây là sơ đồ minh họa luồng hoạt động chính.

```mermaid
graph TD
    A[Bắt đầu] --> B{Tạo yêu cầu hiến máu<br/>(Customer)};
    B --> C{Chờ xác nhận<br/>Trạng thái: PENDING};
    C --> D{Xác nhận lịch hẹn<br/>(Staff)<br/>Trạng thái: APPOINTMENT_CONFIRMED};
    C --> E{Từ chối yêu cầu<br/>(Staff)<br/>Trạng thái: REJECTED};
    C --> F{Hủy yêu cầu<br/>(Customer)<br/>Trạng thái: REJECTED};
    D --> G{Hoàn tất lấy máu<br/>(Staff)<br/>Trạng thái: COMPLETED};
    D --> H{Hủy lịch hẹn<br/>(Staff)<br/>Trạng thái: APPOINTMENT_CANCELLED};
    D --> I{Vắng mặt<br/>(Staff)<br/>Trạng thái: APPOINTMENT_ABSENT};
    G --> J{Trả kết quả<br/>(Staff)<br/>Trạng thái: RESULT_RETURNED};
    J --> K[Kết thúc];
    E --> K;
    F --> K;
    H --> K;
    I --> K;
```

## 3. Cấu trúc dữ liệu (Entities)

### 3.1. `Campaign`

Lưu trữ thông tin về một chiến dịch hiến máu.

| Thuộc tính            | Kiểu dữ liệu     | Bắt buộc | Mô tả                                                          |
| :-------------------- | :--------------- | :------- | :------------------------------------------------------------- |
| `name`                | `string`         | Có       | Tên của chiến dịch.                                            |
| `description`         | `string`         | Không    | Mô tả chi tiết về chiến dịch.                                  |
| `startDate`           | `Date`           | Có       | Ngày bắt đầu chiến dịch (cho phép đăng ký).                    |
| `endDate`             | `Date`           | Có       | Ngày kết thúc chiến dịch (ngừng nhận đăng ký).                 |
| `status`              | `CampaignStatus` | Không    | Trạng thái hiện tại của chiến dịch. Mặc định: `NOT_STARTED`.   |
| `banner`              | `string`         | Không    | URL ảnh bìa của chiến dịch.                                    |
| `location`            | `string`         | Không    | Địa điểm tổ chức chính của chiến dịch.                         |
| `limitDonation`       | `number`         | Không    | Số lượng người đăng ký tối đa. Mặc định: `0` (không giới hạn). |
| `bloodCollectionDate` | `Date`           | Không    | Ngày tổ chức lấy máu tập trung (nếu có).                       |
| `metadata`            | `JSON`           | Không    | Lưu trữ các thông tin phụ dạng key-value.                      |

#### Enum: `CampaignStatus`

| Trạng thái    | Mô tả                                      |
| :------------ | :----------------------------------------- |
| `ACTIVE`      | Chiến dịch đang hoạt động và nhận đăng ký. |
| `NOT_STARTED` | Chiến dịch chưa bắt đầu.                   |
| `ENDED`       | Chiến dịch đã kết thúc.                    |

---

### 3.2. `CampaignDonation`

Đại diện cho một yêu cầu hiến máu của một `Customer` cho một `Campaign`.

| Thuộc tính        | Kiểu dữ liệu             | Bắt buộc | Mô tả                                                 |
| :---------------- | :----------------------- | :------- | :---------------------------------------------------- |
| `campaign`        | `Campaign`               | Có       | Liên kết đến chiến dịch mà người dùng đăng ký.        |
| `donor`           | `Customer`               | Có       | Liên kết đến người dùng (người hiến máu).             |
| `currentStatus`   | `CampaignDonationStatus` | Có       | Trạng thái hiện tại của yêu cầu. Mặc định: `PENDING`. |
| `appointmentDate` | `Date`                   | Không    | Ngày hẹn lấy máu đã được xác nhận.                    |

#### Enum: `CampaignDonationStatus`

Đây là enum quan trọng nhất để theo dõi tiến trình của một yêu cầu hiến máu.

| Trạng thái              | Mô tả                                                                  | Ai thực hiện     |
| :---------------------- | :--------------------------------------------------------------------- | :--------------- |
| `PENDING`               | Yêu cầu vừa được tạo, đang chờ xử lý.                                  | Customer         |
| `REJECTED`              | Yêu cầu bị từ chối bởi nhân viên hoặc bị hủy bởi người dùng.           | Staff / Customer |
| `APPOINTMENT_CONFIRMED` | Lịch hẹn đã được nhân viên xác nhận.                                   | Staff            |
| `APPOINTMENT_CANCELLED` | Lịch hẹn đã bị nhân viên hủy.                                          | Staff            |
| `APPOINTMENT_ABSENT`    | Người hiến máu không đến vào ngày hẹn.                                 | Staff            |
| `COMPLETED`             | Đã hoàn tất quá trình lấy máu, đang chờ kết quả xét nghiệm.            | Staff            |
| `RESULT_RETURNED`       | Đã có kết quả xét nghiệm và trả về cho người dùng. Quy trình hoàn tất. | Staff            |

---

### 3.3. `CampaignDonationLog`

Ghi lại lịch sử thay đổi trạng thái của một `CampaignDonation`. Mỗi lần `currentStatus` của `CampaignDonation` thay đổi, một record mới sẽ được tạo ở đây.

| Thuộc tính         | Kiểu dữ liệu             | Bắt buộc | Mô tả                                               |
| :----------------- | :----------------------- | :------- | :-------------------------------------------------- |
| `campaignDonation` | `CampaignDonation`       | Có       | Liên kết đến yêu cầu hiến máu.                      |
| `status`           | `CampaignDonationStatus` | Có       | Trạng thái được ghi nhận tại thời điểm đó.          |
| `note`             | `string`                 | Không    | Ghi chú của nhân viên cho việc thay đổi trạng thái. |
| `staff`            | `Staff`                  | Không    | Nhân viên đã thực hiện thay đổi (nếu có).           |

---

### 3.4. `DonationResult`

Lưu trữ kết quả xét nghiệm máu sau khi quá trình lấy máu hoàn tất (`COMPLETED`).

| Thuộc tính         | Kiểu dữ liệu       | Bắt buộc | Mô tả                                  |
| :----------------- | :----------------- | :------- | :------------------------------------- |
| `campaignDonation` | `CampaignDonation` | Có       | Liên kết đến yêu cầu hiến máu.         |
| `bloodTestResults` | `JSON`             | Không    | Lưu kết quả xét nghiệm dưới dạng JSON. |
| `resultDate`       | `Date`             | Không    | Ngày có kết quả.                       |
| `notes`            | `string`           | Không    | Ghi chú thêm của nhân viên về kết quả. |
| `processedBy`      | `Staff`            | Không    | Nhân viên đã xử lý và nhập kết quả.    |

## 4. Phân quyền (Roles)

| Vai trò        | Quyền hạn                                                                                                                                                                                                                                                                         |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ADMIN`**    | - Quản lý CRUD (Tạo, Đọc, Cập nhật, Xóa) các chiến dịch (`Campaign`).<br>- Xem tất cả các yêu cầu hiến máu (`CampaignDonation`) của mọi chiến dịch.<br>- Có tất cả các quyền của `STAFF`.                                                                                         |
| **`STAFF`**    | - Xem danh sách các yêu cầu hiến máu.<br>- Cập nhật trạng thái của một yêu cầu hiến máu (xác nhận, từ chối, hoàn thành, ...).<br>- Xem và cập nhật kết quả hiến máu (`DonationResult`).                                                                                           |
| **`CUSTOMER`** | - Xem danh sách các chiến dịch.<br>- Tạo yêu cầu hiến máu (`CampaignDonation`) cho bản thân.<br>- Xem danh sách các yêu cầu hiến máu của mình.<br>- Hủy một yêu cầu hiến máu của mình nếu nó đang ở trạng thái `PENDING`.<br>- Xem kết quả hiến máu của mình sau khi được trả về. |

## 5. API Endpoints

### 5.1. Module Campaign (`/campaigns`)

#### `POST /campaigns`

- **Chức năng:** Tạo một chiến dịch mới.
- **Quyền truy cập:** `ADMIN`.
- **Request Body DTO (`CreateCampaignDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `name` | `string` | Có | Tên của chiến dịch. |
  | `description`| `string` | Không | Mô tả chi tiết. |
  | `startDate` | `Date` | Có | Ngày bắt đầu. |
  | `endDate` | `Date` | Có | Ngày kết thúc. |
  | `status` | `CampaignStatus`| Không | Mặc định là `NOT_STARTED`. |
  | `banner` | `string` | Không | URL ảnh bìa. |
  | `location` | `string` | Không | Địa điểm. |
  | `limitDonation`| `number` | Không | Giới hạn số người đăng ký. |
  | `bloodCollectionDate`| `Date` | Không | Ngày lấy máu tập trung. |
  | `metadata` | `JSON` | Không | Dữ liệu phụ. |
- **Response:** Dữ liệu của `Campaign` vừa được tạo.

#### `GET /campaigns`

- **Chức năng:** Lấy danh sách các chiến dịch với phân trang.
- **Quyền truy cập:** Công khai.
- **Query Params DTO (`CampaignListQueryDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `page` | `number` | Không | Trang hiện tại (mặc định: 1). |
  | `limit`| `number` | Không | Số lượng trên một trang (mặc định: 10). |
  | `status` | `CampaignStatus`| Không | Lọc theo trạng thái chiến dịch. |
  | `search` | `string` | Không | Tìm kiếm theo tên, mô tả, địa điểm. |
- **Response:** Đối tượng phân trang chứa danh sách `Campaign`.

#### `GET /campaigns/:id`

- **Chức năng:** Lấy thông tin chi tiết của một chiến dịch.
- **Quyền truy cập:** Công khai.
- **Response:** Dữ liệu chi tiết của `Campaign`.

#### `PATCH /campaigns/:id`

- **Chức năng:** Cập nhật thông tin một chiến dịch.
- **Quyền truy cập:** `ADMIN`.
- **Request Body DTO (`UpdateCampaignDto`):**
  - Gồm các trường tương tự `CreateCampaignDto` nhưng tất cả đều là tùy chọn (không bắt buộc).
- **Response:** Dữ liệu của `Campaign` sau khi cập nhật.

#### `DELETE /campaigns/:id`

- **Chức năng:** Xóa một chiến dịch.
- **Quyền truy cập:** `ADMIN`.
- **Response:** `200 OK`.

#### `GET /campaigns/:id/donation-requests`

- **Chức năng:** Lấy danh sách các yêu cầu hiến máu của một chiến dịch cụ thể.
- **Quyền truy cập:** `ADMIN`, `STAFF`.
- **Query Params DTO (`CampaignDonationRequestsQueryDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `page` | `number` | Không | Trang hiện tại (mặc định: 1). |
  | `limit`| `number` | Không | Số lượng trên một trang (mặc định: 10). |
  | `status` | `CampaignDonationStatus`| Không | Lọc theo trạng thái yêu cầu hiến máu. |
- **Response:** Đối tượng phân trang chứa danh sách `CampaignDonation`.

### 5.2. Module Donation (`/donations`)

#### Endpoints cho Customer

#### `POST /donations/requests`

- **Chức năng:** Customer tạo một yêu cầu hiến máu cho một chiến dịch.
- **Quyền truy cập:** `CUSTOMER` (đã xác thực).
- **Request Body DTO (`CreateDonationRequestDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `campaignId` | `string` | Có | ID của chiến dịch muốn tham gia. |
  | `appointmentDate`| `Date` | Không | Ngày hẹn đề xuất. Phải trùng với `bloodCollectionDate` của campaign (nếu có). |
  | `note` | `string` | Không | Ghi chú của người dùng. |
- **Response:** `CampaignDonation` vừa được tạo.

#### `GET /donations/my-requests`

- **Chức năng:** Lấy danh sách các yêu cầu hiến máu của chính user đó.
- **Quyền truy cập:** `CUSTOMER` (đã xác thực).
- **Query Params DTO (`DonationRequestListQueryDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `page` | `number` | Không | Trang hiện tại (mặc định: 1). |
  | `limit`| `number` | Không | Số lượng trên một trang (mặc định: 10). |
  | `status` | `CampaignDonationStatus`| Không | Lọc theo trạng thái yêu cầu hiến máu. |
- **Response:** Đối tượng phân trang chứa danh sách `CampaignDonation`.

#### `GET /donations/my-requests/:id`

- **Chức năng:** Lấy chi tiết một yêu cầu hiến máu của chính user đó.
- **Quyền truy cập:** `CUSTOMER` (đã xác thực).
- **Response:** `CampaignDonation` cùng với `CampaignDonationLog`.

#### `GET /donations/my-requests/:id/result`

- **Chức năng:** Lấy kết quả hiến máu của một yêu cầu.
- **Quyền truy cập:** `CUSTOMER` (đã xác thực).
- **Điều kiện:** Yêu cầu phải thuộc về user và đã có kết quả.
- **Response:** `DonationResult`.

#### `PATCH /donations/my-requests/:id/cancel`

- **Chức năng:** Customer tự hủy yêu cầu hiến máu của mình.
- **Quyền truy cập:** `CUSTOMER` (đã xác thực).
- **Điều kiện:** Yêu cầu phải đang ở trạng thái `PENDING`.
- **Response:** `CampaignDonation` đã được cập nhật trạng thái thành `REJECTED`.

---

#### Endpoints cho Staff/Admin

#### `GET /donations/requests`

- **Chức năng:** Lấy tất cả yêu cầu hiến máu trong hệ thống.
- **Quyền truy cập:** `ADMIN`, `STAFF`.
- **Query Params DTO (`DonationRequestListQueryDto`):**
  - Tương tự DTO của `GET /donations/my-requests`.
- **Response:** Danh sách `CampaignDonation` có phân trang.

#### `GET /donations/requests/:id`

- **Chức năng:** Lấy chi tiết một yêu cầu hiến máu bất kỳ.
- **Quyền truy cập:** `ADMIN`, `STAFF`.
- **Response:** `CampaignDonation` và `CampaignDonationLog`.

#### `PATCH /donations/requests/:id/status`

- **Chức năng:** Cập nhật trạng thái của một yêu cầu hiến máu.
- **Quyền truy cập:** `STAFF`.
- **Request Body DTO (`UpdateDonationRequestStatusDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `status` | `CampaignDonationStatus`| Có | Trạng thái mới muốn cập nhật. |
  | `appointmentDate`| `Date` | Không | Cập nhật ngày hẹn. |
  | `note` | `string` | Không | Ghi chú của nhân viên. |
- **Logic quan trọng:**
  - Tuân thủ theo quy tắc chuyển đổi trạng thái đã định nghĩa.
  - Nếu chuyển sang `COMPLETED`, hệ thống sẽ tự động tạo một record `DonationResult` trống.
- **Response:** `CampaignDonation` sau khi cập nhật.

#### `GET /donations/results`

- **Chức năng:** Lấy danh sách tất cả các kết quả hiến máu.
- **Quyền truy cập:** `ADMIN`, `STAFF`.
- **Query Params:** `page`, `limit`.
- **Response:** Danh sách `DonationResult` có phân trang.

#### `GET /donations/requests/:id/result`

- **Chức năng:** Lấy kết quả hiến máu của một yêu cầu bất kỳ.
- **Quyền truy cập:** `ADMIN`, `STAFF`.
- **Response:** `DonationResult`.

#### `PATCH /donations/requests/:id/result`

- **Chức năng:** Cập nhật thông tin kết quả xét nghiệm.
- **Quyền truy cập:** `STAFF`.
- **Request Body DTO (`UpdateDonationResultDto`):**
  | Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `bloodTestResults` | `JSON` | Không | Dữ liệu kết quả xét nghiệm. |
  | `notes` | `string` | Không | Ghi chú của nhân viên về kết quả. |
- **Logic quan trọng:**
  - Yêu cầu phải ở trạng thái `COMPLETED`.
  - Sau khi cập nhật thành công, trạng thái của `CampaignDonation` sẽ tự động chuyển thành `RESULT_RETURNED`.
- **Response:** `DonationResult` sau khi cập nhật.
