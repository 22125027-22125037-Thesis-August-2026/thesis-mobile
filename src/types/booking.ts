export type BookingAppointment = {
  id: string;
  therapistId: string;
  therapistName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Đã xác nhận' | 'Đang chờ';
};

export type ContactMethod = 'Nhắn tin' | 'Gọi điện thoại' | 'Gọi Video';
