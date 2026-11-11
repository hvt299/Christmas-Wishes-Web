export type ChristmasState = {
    isChristmasSeason: boolean;
    targetDate: number;
    currentYear: number;
};

export type VietnamDateParts = {
    year: number;
    month: number;
    day: number;
};

const TIME_ZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_UTC_OFFSET_HOURS = 7;

/**
 * Lấy ngày, tháng, năm hiện tại theo múi giờ Việt Nam.
 */
export const getVietnamDateParts = (
    date: Date = new Date()
): VietnamDateParts => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
    }).formatToParts(date);

    const values: Record<string, number> = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = Number(part.value);
        }
    }

    const { year, month, day } = values;

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        throw new Error("Không thể xác định ngày hiện tại tại Việt Nam.");
    }

    return { year, month, day };
};

/**
 * Tạo timestamp tương ứng với thời điểm tại Việt Nam.
 * Việt Nam sử dụng UTC+7 và không áp dụng DST.
 *
 * Tháng sử dụng cách đánh số thông thường: 1 = tháng 1, 12 = tháng 12.
 */
export const vietnamTimestamp = (
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0
): number => {
    return (
        Date.UTC(year, month - 1, day, hour, minute, second) -
        VIETNAM_UTC_OFFSET_HOURS * 60 * 60 * 1000
    );
};

/**
 * Mốc thời gian bắt đầu công khai nội dung quà và lời ước.
 * 00:00 ngày 25/12 theo giờ Việt Nam của năm cây.
 */
export const getChristmasUnlockTimestamp = (year: number): number => {
    return vietnamTimestamp(year, 12, 25);
};

/**
 * Kiểm tra nội dung quà và lời ước đã được công khai hay chưa.
 *
 * Dùng chung quy tắc với backend:
 * từ 00:00 ngày 25/12 GMT+7.
 */
export const canRevealContents = (
    year: number,
    now: number = Date.now()
): boolean => {
    if (!Number.isInteger(year) || year < 2000 || year > 9999) {
        return false;
    }

    return now >= getChristmasUnlockTimestamp(year);
};

/**
 * Kiểm tra khoảng thời gian được tạo cây Giáng Sinh.
 *
 * Từ 00:00 ngày 01/12 đến trước 00:00 ngày 25/12
 * theo múi giờ Việt Nam.
 *
 * Backend vẫn phải kiểm tra điều kiện này khi nhận API.
 */
export const canCreateTree = (
    year: number,
    now: number = Date.now()
): boolean => {
    if (!Number.isInteger(year) || year < 2000 || year > 9999) {
        return false;
    }

    const current = getVietnamDateParts(new Date(now));

    // Chỉ tạo cây cho năm hiện tại tại Việt Nam.
    if (year !== current.year) {
        return false;
    }

    const unlockAt = vietnamTimestamp(year, 12, 1);
    const closeAt = getChristmasUnlockTimestamp(year);

    return now >= unlockAt && now < closeAt;
};

/**
 * Trạng thái mùa Giáng Sinh và ngày đếm ngược.
 *
 * Mùa Giáng Sinh: từ 25/12 đến hết 31/12 theo ngày lịch Việt Nam.
 *
 * Trong mùa: targetDate là 25/12 của năm hiện tại.
 * Ngoài mùa: targetDate là ngày 25/12 tiếp theo.
 */
export const checkChristmasState = (
    now: number = Date.now()
): ChristmasState => {
    const { year, month, day } = getVietnamDateParts(new Date(now));

    const isChristmasSeason = month === 12 && day >= 25;

    if (isChristmasSeason) {
        return {
            isChristmasSeason: true,
            targetDate: getChristmasUnlockTimestamp(year),
            currentYear: year,
        };
    }

    // Từ 01/01 đến trước 25/12:
    // đếm ngược đến Giáng Sinh của năm hiện tại.
    //
    // Sau 31/12, năm hiện tại tự tăng theo lịch Việt Nam,
    // nên không cần nhánh hasPassedChristmas riêng.
    return {
        isChristmasSeason: false,
        targetDate: getChristmasUnlockTimestamp(year),
        currentYear: year,
    };
};

/**
 * Giải mã payload JWT.
 *
 * Lưu ý:
 * - Không xác minh chữ ký JWT.
 * - Không thay thế xác thực ở backend.
 * - Không tự xác nhận người dùng đã đăng nhập.
 */
export const parseJwt = (token: string): unknown | null => {
    try {
        const segments = token.split(".");

        if (
            segments.length !== 3 ||
            !segments[1] ||
            !/^[A-Za-z0-9_-]+$/.test(segments[1])
        ) {
            return null;
        }

        const base64 = segments[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedBase64 = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
        );

        const binaryString = atob(paddedBase64);

        const bytes = Uint8Array.from(
            binaryString,
            (char) => char.charCodeAt(0)
        );

        const payload = new TextDecoder("utf-8", {
            fatal: true,
        }).decode(bytes);

        const parsed: unknown = JSON.parse(payload);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
};