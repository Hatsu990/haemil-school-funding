import Link from "next/link";
import { StudentCard } from "@/components/public/student-card";
import {
  publicSponsorMessages,
  sponsorships,
  students,
  totalStudentCount,
} from "@/lib/mock-data";

const matchedCount = 24;
const pendingCount = 6;
const progressRate = Math.round((matchedCount / totalStudentCount) * 100);

export default function HomePage() {
  return (
    <div className="pb-16">
      <section className="container-base grid gap-8 pt-12 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-[#fce5d1] px-4 py-1 text-xs font-bold tracking-[0.1em] text-[#915831]">
            해밀학교 생활관비 1:1 결연 후원
          </p>
          <h1 className="font-serif text-4xl leading-tight font-extrabold text-[#2f2017] md:text-5xl">
            생활관비 부담을 줄여
            <br />
            학생의 배움을 지켜주세요
          </h1>
          <p className="max-w-xl text-base leading-7 text-[#5e4a3d]">
            해밀학교는 다문화 학생과 중도입국 학생이 안정적으로 생활하고
            학업에 집중할 수 있도록 생활관비 결연 후원을 운영합니다. 한 명의
            학생에게 한 명의 후원자가 연결되는 구조로, 지원 흐름을 투명하게
            관리합니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/students" className="btn-primary">
              학생 만나기
            </Link>
            <Link href="/project" className="btn-secondary">
              후원 절차 보기
            </Link>
          </div>
        </div>

        <aside className="surface-card p-6">
          <h2 className="text-lg font-bold text-[#2f221a]">결연 현황</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#fff2e6] p-4">
              <p className="text-xs font-medium text-[#7b5a46]">결연 완료</p>
              <p className="mt-1 text-2xl font-bold">{matchedCount}명</p>
            </div>
            <div className="rounded-xl bg-[#fff8df] p-4">
              <p className="text-xs font-medium text-[#7b5a46]">입금 대기</p>
              <p className="mt-1 text-2xl font-bold">{pendingCount}명</p>
            </div>
            <div className="rounded-xl bg-[#ebf3ff] p-4 sm:col-span-2">
              <p className="text-xs font-medium text-[#4c5b73]">목표 대비 진행률</p>
              <p className="mt-1 text-2xl font-bold text-[#2e3b57]">
                {progressRate}% ({matchedCount}/{totalStudentCount})
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d9e5f8]">
                <div
                  className="h-full rounded-full bg-[#5f82c8]"
                  style={{ width: `${progressRate}%` }}
                />
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="container-base mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8f6f5a]">대표 학생 카드</p>
            <h2 className="section-title mt-2">함께 만나볼 학생들</h2>
          </div>
          <Link href="/students" className="text-sm font-semibold text-[#9f592b]">
            전체 학생 보기
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {students.slice(0, 3).map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </section>

      <section className="container-base mt-14 grid gap-6 md:grid-cols-2">
        <article className="surface-card p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">후원자 응원 메시지</h2>
          <div className="mt-4 space-y-3">
            {publicSponsorMessages.slice(0, 3).map((item) => (
              <blockquote
                key={item.id}
                className="rounded-xl border border-[var(--border)] bg-[#fff8f1] p-4"
              >
                <p className="text-sm leading-6 text-[#5b473a]">{item.message}</p>
                <footer className="mt-2 text-xs font-semibold text-[#8f6f5a]">
                  후원자 {item.sponsorName}
                </footer>
              </blockquote>
            ))}
          </div>
        </article>

        <article className="surface-card p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">운영 원칙</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5c493c]">
            <li>학생 실명과 실제 학생 사진은 공개하지 않습니다.</li>
            <li>학생 프로필은 AI 카툰 이미지 정책을 유지합니다.</li>
            <li>학생 1명당 후원자 1명만 결연 가능합니다.</li>
            <li>입금 완료 기준으로 결연이 확정됩니다.</li>
            <li>자동 결제는 제공하지 않으며 관리자가 직접 안내합니다.</li>
          </ul>
          <div className="mt-5 flex gap-2">
            <Link href="/project" className="btn-secondary py-2">
              세부 정책 보기
            </Link>
            <Link href="/students" className="btn-primary py-2">
              결연 신청하러 가기
            </Link>
          </div>
        </article>
      </section>

      <section className="container-base mt-14">
        <div className="surface-card grid gap-4 bg-gradient-to-r from-[#fce6d3] to-[#f9eddc] p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2f2118]">
              한 번의 후원이 학생의 한 학기를 지탱합니다
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#664f40]">
              현재 접수된 후원 신청 {sponsorships.length}건을 기반으로 운영 중입니다.
              지금 참여하시면 관리자가 직접 연락드려 결연 과정을 안내합니다.
            </p>
          </div>
          <Link href="/students" className="btn-primary">
            지금 결연 신청하기
          </Link>
        </div>
      </section>
    </div>
  );
}
