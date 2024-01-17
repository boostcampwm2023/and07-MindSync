package boostcamp.and07.mindsync.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp
import boostcamp.and07.mindsync.R

val PretendardSemiBold = FontFamily(Font(R.font.pretendard_semi_bold))
val PretendardMedium = FontFamily(Font(R.font.pretendard_medium))
val PretendardRegular = FontFamily(Font(R.font.pretendard_regular))
val PretendardLight = FontFamily(Font(R.font.pretendard_light))

val defaultTextStyle = TextStyle(
    platformStyle = PlatformTextStyle(
        includeFontPadding = false,
    ),
)

val Typography = Typography(
    displayLarge = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 24.sp,
    ),
    displayMedium = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 20.sp,
    ),
    displaySmall = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 18.sp,
    ),
    headlineLarge = defaultTextStyle.copy(
        fontFamily = PretendardMedium,
        fontSize = 16.sp,
    ),
    headlineMedium = defaultTextStyle.copy(
        fontFamily = PretendardRegular,
        fontSize = 16.sp,
    ),
    headlineSmall = defaultTextStyle.copy(
        fontFamily = PretendardMedium,
        fontSize = 14.sp,
    ),
    titleLarge = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 18.sp,
    ),
    titleMedium = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 16.sp,
    ),
    titleSmall = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 14.sp,
    ),
    bodyLarge = defaultTextStyle.copy(
        fontFamily = PretendardMedium,
        fontSize = 12.sp,
    ),
    bodyMedium = defaultTextStyle.copy(
        fontFamily = PretendardRegular,
        fontSize = 12.sp,
    ),
    bodySmall = defaultTextStyle.copy(
        fontFamily = PretendardLight,
        fontSize = 12.sp,
    ),
    labelLarge = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 18.sp,
    ),
    labelMedium = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 16.sp,
    ),
    labelSmall = defaultTextStyle.copy(
        fontFamily = PretendardSemiBold,
        fontSize = 14.sp,
    ),
)
