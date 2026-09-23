# Spring 글에 이어 쓸 것

`redis-java.mdx` 끝에 있던 초안 메모다. 2026-09-23 글을 마무리하면서 본문에서 뺐다.

- `@Cacheable` 로 캐시 붙이기. 직접 `opsForValue` 를 부르는 것과의 차이
- Spring Session 으로 세션을 Redis 에 두기
- 커넥션 풀 설정 (Lettuce 기본값과 바꿔야 하는 경우)
- 직렬화를 JSON 으로 바꾸는 `RedisTemplate` 설정
- 분산 락

## 공개할 때 되살릴 링크

2026-09-23 개념 글과 도커 글을 먼저 공개하면서, 초안인 이 글을 가리키던 문장을 뺐다.
이 글을 `draft: false` 로 바꿀 때 아래를 제자리에 다시 넣는다. 안 넣으면 1·2편에서 3편으로 가는 길이 없다.

| 글 | 자리 | 뺀 문장 |
| --- | --- | --- |
| `blog/redis-basics.mdx` | 「Hash」 코드블록 바로 뒤 | `` `HashOperations` 처럼 Java 쪽 대응은 [2편](/blog/redis-java/)에 있습니다. `` — "2편" 은 "3편" 으로 고칠 것 |
| `blog/redis-basics.mdx` | 「만료 걸기」와 「명령어 한눈에」 사이 | 절 전체. `## Java 에서 쓰기` / Spring 에서 붙이는 방법은 [따로 정리했습니다](/blog/redis-java/). 여기 나온 명령이 `StringRedisTemplate` 에서 각각 무엇에 대응하는지도 거기 있습니다. |
| `blog/redis-docker.mdx` | 맨 끝 | Spring 에서 쓰는 방법은 [Spring 에서 Redis 쓰기](/blog/redis-java/)에 있습니다. |

이 글 첫 문장의 `[앞 글](/blog/redis-basics/)` 은 개념 글이 공개됐으니 그대로 둬도 된다.

영어판은 이 글의 영어판을 만들 때 같이 넣는다. 영어 개념 글과 도커 글에는 처음부터 이 링크가 없다.
